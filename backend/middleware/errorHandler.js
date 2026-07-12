/**
 * Centralized error handler. Must be registered LAST in app.js.
 * Express identifies this as an error handler by its four arguments,
 * so `next` must stay in the signature even though it is unused.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
