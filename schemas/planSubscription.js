const { z } = require("zod");

// Reusable status enum
const SubscriptionStatus = z.enum(["ACTIVE", "INACTIVE", "CANCELLED", "EXPIRED"]);

// 1. Create Subscription
const createSubscriptionSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
});

// 2. Update Subscription
const updateSubscriptionSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  status: SubscriptionStatus,
});

// 3. Cancel Subscription
const cancelSubscriptionSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
});

module.exports = {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
};
