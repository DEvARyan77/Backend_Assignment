const Subscription = require('../../models/subscription');
const Plan = require('../../models/plan');
const {withRetry} = require('../../utils/retry');

const createSubscription = async (req, res) => {
  const { planName } = req.body;
  const email = req.user.email;

  if (!planName || !email) {
    return res.status(400).json({ message: 'planName and user email are required.' });
  }

  try {
    // 🔍 Fetch the plan by name
    const plan = await withRetry(() => Plan.findOne({ planName }));
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // 📆 Calculate end date
    const durationInDays = parseInt(plan.planDuration);
    if (isNaN(durationInDays)) {
      return res.status(400).json({ message: 'Invalid planDuration in plan' });
    }
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationInDays);

    // ❌ Check if user already has an active subscription to the same plan
    const existingSub = await Subscription.findOne({
      email,
      planName,
      status: 'ACTIVE'
    });

    if (existingSub) {
      return res.status(400).json({ message: 'User already has an active subscription to this plan' });
    }

    // ✅ Create new subscription
    const newSubscription = await withRetry(() =>
      Subscription.create({
        email,
        planName,
        status: 'ACTIVE',
        endDate
      })
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: newSubscription
    });

  } catch (err) {
    res.status(500).json({
      message: 'Error creating subscription',
      error: err.message
    });
  }
};

const getSubscription = async (req, res) => {
  const email = req.user.email;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // 🔍 Fetch active subscriptions that haven't expired
    const subscriptions = await withRetry(() =>
      Subscription.find({
        email,
        status: 'ACTIVE',
        endDate: { $gte: today }
      })
    );

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: 'No active subscriptions found' });
    }

    // 🔁 Optionally fetch plan details for each subscription
    const detailedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await Plan.findOne({ planName: sub.planName });
        return {
          subscription: sub,
          plan
        };
      })
    );

    res.status(200).json({ subscriptions: detailedSubscriptions });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching subscriptions',
      error: err.message
    });
  }
};

const updateSubscription = async (req, res) => {
  const email = req.user.email;
  const { planName, status } = req.body;

  if (!planName || !status) {
    return res.status(400).json({ message: 'Plan name and status are required' });
  }

  // Optional: Validate status value against your enum
  const validStatuses = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Find plan by planName
    const plan = await withRetry(() => Plan.findOne({ planName }));
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const durationInDays = parseInt(plan.planDuration);
    if (isNaN(durationInDays)) {
      return res.status(400).json({ message: 'Invalid plan duration' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationInDays);

    // If updating to ACTIVE, set all user's other ACTIVE subscriptions to INACTIVE
    if (status === 'ACTIVE') {
      await withRetry(() =>
        Subscription.updateMany(
          { email, status: 'ACTIVE' },
          { $set: { status: 'INACTIVE' } }
        )
      );
    }

    // Find existing subscription with this planName and user
    let subscription = await withRetry(() =>
      Subscription.findOne({ email, planName })
    );

    if (subscription) {
      // Update existing subscription
      subscription.status = status;
      subscription.endDate = endDate;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await withRetry(() =>
        Subscription.create({
          email,
          planName,
          status,
          endDate
        })
      );
    }

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error updating subscription',
      error: err.message
    });
  }
};

const cancelSubscription = async (req, res) => {
  const email = req.user.email;
  const { planName } = req.body; // or req.params or req.query depending on how you pass it

  if (!planName) {
    return res.status(400).json({ message: 'Plan name is required to cancel subscription' });
  }

  try {
    const subscription = await withRetry(() =>
      Subscription.findOne({ email, planName })
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'CANCELLED';
    await subscription.save();

    res.status(200).json({
      message: 'Subscription cancelled',
      subscription
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error cancelling subscription',
      error: err.message
    });
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
};
