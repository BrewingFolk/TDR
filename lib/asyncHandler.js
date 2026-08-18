// Wraps an async Express route handler so a rejected promise is passed to
// next(err) instead of becoming an unhandled rejection that crashes the process.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
