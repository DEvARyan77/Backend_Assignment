const { z } = require('zod');

const createPlanSchema = z.object({
  planName: z.string().min(1, "planName is required"),
  planPrice: z.number().positive("planPrice must be a positive number"),
  planTimeSpan: z.string().min(1, "planTimeSpan is required"),
  planDuration: z.string().min(1, "planDuration is required").refine((val) => {
    const date = new Date(val);
    const today = new Date();
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return !isNaN(date.getTime()) && date > today;
  }, {
    message: "planDuration must be a valid future date string",
  }),
  features: z.array(z.string().min(1)).min(1, "features must be a non-empty array of strings"),
});

module.exports = { createPlanSchema };
