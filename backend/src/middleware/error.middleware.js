const errorHandler = (err, req, res, next) => {
  console.error("BACKEND ERROR:", err);
  console.error("ERROR MESSAGE:", err.message);
  console.error("ERROR STACK:", err.stack);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;