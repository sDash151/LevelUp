/**
 * Wraps async route handlers to forward rejected promises to Express error handler.
 * Eliminates try/catch boilerplate in controllers.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
