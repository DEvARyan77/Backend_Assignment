const Plan = require('../../models/plan');
const { client } = require('../../utils/redis');
const { withRetry } = require('../../utils/retry');

// Create a new plan
const createPlan = async (req, res) => {
  const { planName, planPrice, planTimeSpan, planDuration, features } = req.body;
  const email = req.user.email;

  if (!email || !planName || !planPrice || !planDuration || !planTimeSpan || !features || !Array.isArray(features)) {
    return res.status(400).json({ message: 'All fields are required and features must be an array.' });
  }

  // Parse planDuration string like "20 May 2025" into Date object
  const planDate = new Date(planDuration);

  if (isNaN(planDate.getTime())) {
    return res.status(400).json({ message: 'Invalid planDuration date format. Please use a valid date string like "20 May 2025".' });
  }

  // Normalize time for comparison (set to start of the day)
  planDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (planDate <= today) {
    return res.status(400).json({ message: 'planDuration must be a valid future date (after today).' });
  }

  try {
    // Check for unique planName
    const existingPlan = await Plan.findOne({ planName });
    if (existingPlan) {
      return res.status(409).json({ message: 'Plan name already exists. Please choose a different name.' });
    }

    const newPlan = await withRetry(async () => {
      return await Plan.create({
        email,
        planName,
        planPrice,
        planDuration: planDate,  // store as Date object
        planTimeSpan,
        features,
      });
    });

    // Invalidate cache after creating a new plan
    await withRetry(
      async () => await client.del('allPlans'),
      { maxRetries: 2 }
    );

    res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (err) {
    res.status(500).json({
      message: 'Error creating plan',
      error: err.message,
      details: err.stack
    });
  }
};

// Get all plans
const getAllPlans = async (req, res) => {
  try {
    const cachedPlans = await client.get('allPlans');

    if (cachedPlans) {
      return res.status(200).json(JSON.parse(cachedPlans));
    }

    // Fetch all plans from DB
    const plans = await withRetry(() => Plan.find());

    const today = new Date();
    const validPlans = [];
    
    for (const plan of plans) {
      const planDate = new Date(plan.planDuration); // convert to Date object

      if (!isNaN(planDate) && planDate >= today) {
        // Future plan: keep it
        validPlans.push(plan);

        // Cache this valid plan
        await client.setEx(`plan:id:${plan._id}`, 300, JSON.stringify(plan));
        await client.setEx(`plan:name:${plan.planName}`, 300, JSON.stringify(plan));
      } else {
        // Expired plan: delete from DB & cache
        await Plan.findByIdAndDelete(plan._id);
        await client.del(`plan:id:${plan._id}`);
        await client.del(`plan:name:${plan.planName}`);
      }
    }

    // Cache only valid plans
    await client.setEx('allPlans', 300, JSON.stringify(validPlans));

    res.status(200).json(validPlans);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching plans',
      error: err.message,
      retryInfo: err.retryAttempts ? `Failed after ${err.retryAttempts} attempts` : undefined
    });
  }
};

const getPlanById = async (req, res) => {
  const { id } = req.params;

  try {
    const cached = await client.get(`plan:id:${id}`);
    if (cached) {
      const plan = JSON.parse(cached);
      const planDate = new Date(plan.planDuration);
      const today = new Date();

      if (isNaN(planDate) || planDate < today) {
        await client.del(`plan:id:${id}`);
        await client.del(`plan:name:${plan.planName}`);
        return res.status(404).json({ message: 'Plan expired or invalid' });
      }

      return res.status(200).json(plan);
    }

    const plan = await withRetry(() => Plan.findById(id));
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const planDate = new Date(plan.planDuration);
    const today = new Date();

    if (isNaN(planDate) || planDate < today) {
      await Plan.findByIdAndDelete(id);
      await client.del(`plan:id:${id}`);
      await client.del(`plan:name:${plan.planName}`);
      return res.status(404).json({ message: 'Plan expired or invalid' });
    }

    await client.setEx(`plan:id:${id}`, 300, JSON.stringify(plan));
    await client.setEx(`plan:name:${plan.planName}`, 300, JSON.stringify(plan));

    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plan', error: err.message });
  }
};

const getPlanByName = async (req, res) => {
  const { planName } = req.params;

  try {
    const cached = await client.get(`plan:name:${planName}`);
    if (cached) {
      const plan = JSON.parse(cached);
      const planDate = new Date(plan.planDuration);
      const today = new Date();

      if (isNaN(planDate) || planDate < today) {
        await client.del(`plan:id:${plan._id}`);
        await client.del(`plan:name:${plan.planName}`);
        return res.status(404).json({ message: 'Plan expired or invalid' });
      }

      return res.status(200).json(plan);
    }

    const plan = await withRetry(() => Plan.findOne({ planName }));
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const planDate = new Date(plan.planDuration);
    const today = new Date();

    if (isNaN(planDate) || planDate < today) {
      await Plan.findByIdAndDelete(plan._id);
      await client.del(`plan:id:${plan._id}`);
      await client.del(`plan:name:${plan.planName}`);
      return res.status(404).json({ message: 'Plan expired' });
    }

    await client.setEx(`plan:id:${plan._id}`, 300, JSON.stringify(plan));
    await client.setEx(`plan:name:${plan.planName}`, 300, JSON.stringify(plan));

    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plan', error: err.message });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlanByName
};