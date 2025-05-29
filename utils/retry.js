const { setTimeout } = require('timers/promises');

// Default configuration
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 100, // Initial delay of 100ms
  multiplier: 2, // Exponential backoff multiplier
  logger: console // Default logger
};



/**
 * Retry wrapper for operations with exponential backoff
 * @param {Function} operation - Async function to execute
 * @param {Object} config - Configuration object
 * @param {number} config.maxRetries - Maximum number of retry attempts
 * @param {number} config.initialDelayMs - Initial delay in milliseconds
 * @param {number} config.multiplier - Backoff multiplier
 * @param {Object} config.logger - Logger object (must have warn method)
 */
async function withRetry(operation, config = {}) {
  const { maxRetries, initialDelayMs, multiplier, logger } = { ...DEFAULT_CONFIG, ...config };
  let attempt = 0;
  let lastError;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(multiplier, attempt - 1);
        logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, error);
        await setTimeout(delay);
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  withRetry,
  DEFAULT_CONFIG
};