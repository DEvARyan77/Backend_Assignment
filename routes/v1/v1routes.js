const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const adminRoutes = require('./admin');
const cron = require('../../utils/expireSubscription')

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to v1 API' });
});

router.use('/users', userRoutes)
router.use('/admin', adminRoutes)

module.exports = router;
