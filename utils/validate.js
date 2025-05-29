const { ZodError } = require('zod');

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next(); // validation passed, continue to next middleware/handler
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err); // unexpected error, forward to error handler
    }
  };
}

module.exports = validateRequest;
