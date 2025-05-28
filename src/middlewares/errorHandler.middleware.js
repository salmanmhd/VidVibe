import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // If error is already an instance of ApiError, use it as is
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      data: err.data,
      errors: err.errors,
      stack: err.stack,
      //   stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Otherwise, create a generic ApiError
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode: statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    errors: [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler };
