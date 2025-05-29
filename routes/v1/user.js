const express = require('express');
const router = express.Router();
const {
  loginCustomer,
  signupCustomer
} = require('../../controllers/v1/customer');
const validateRequest = require('../../utils/validate');
const {loginSchema, signupSchema} = require('../../schemas/customer');
const {createSubscriptionSchema, updateSubscriptionSchema, cancelSubscriptionSchema} = require('../../schemas/planSubscription');
const {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription
} = require('../../controllers/v1/planSubscriptionManagement');
const {authenticate} = require('../../services/auth');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to v1 User API' });
});

router.route('/login').post(validateRequest(loginSchema),loginCustomer);
router.route('/signup').post(validateRequest(signupSchema),signupCustomer);
router.route('/subscriptions').post(authenticate,validateRequest(createSubscriptionSchema),createSubscription)
                              .get(authenticate,getSubscription)
                              .put(authenticate,validateRequest(updateSubscriptionSchema),updateSubscription)
                              .delete(authenticate,validateRequest(cancelSubscriptionSchema),cancelSubscription);

module.exports = router;