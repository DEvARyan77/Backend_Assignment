const express = require('express');
const router = express.Router();
const validateRequest = require('../../utils/validate');
const {
  loginAdmin
} = require('../../controllers/v1/admin');
const { createPlanSchema } = require('../../schemas/plan');
const {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlanByName
} = require('../../controllers/v1/plan');
const { authenticate } = require('../../services/admin.auth');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to v1 Admin API' });
});

router.route('/login').post(loginAdmin);
router.route('/plans').post(authenticate,validateRequest(createPlanSchema),createPlan);
router.route('/plans').get(authenticate,getAllPlans);
router.route('/plans/:id').get(authenticate,getPlanById);
router.route('/plans/name/:planName').get(authenticate,getPlanByName);

module.exports = router;