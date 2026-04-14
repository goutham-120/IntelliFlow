import { logger } from "../config/logger.js";

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || "Server Error";

  logger.error("Unhandled request error", {
    path: req.originalUrl,
    method: req.method,
    status,
    message,
  });

  if (res.headersSent) {
    return next(error);
  }

  return res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" && error.stack
      ? { stack: error.stack }
      : {}),
  });
};

export default errorHandler;
