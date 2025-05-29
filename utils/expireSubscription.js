const Subscription = require('../models/plan');
const dbConnect = require('./db');

const expireSubscriptions = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  await dbConnect();

  const now = new Date();

  try {
    const result = await Subscription.updateMany(
      { status: 'ACTIVE', endDate: { $lte: now } },
      { $set: { status: 'EXPIRED' } }
    );

    res.status(200).json({ message: 'Expired old subscriptions', updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = expireSubscriptions;
