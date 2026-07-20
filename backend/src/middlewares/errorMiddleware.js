import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

/**
 * Global error handler middleware for Express
 * Catches all errors from routes and formats them consistently
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    // Default error response
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = "An unexpected error occurred";
    let data = null;

    // Handle custom ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle JWT errors
    else if (err.name === "JsonWebTokenError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Invalid token";
    }
    // Handle JWT expiry
    else if (err.name === "TokenExpiredError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Token has expired";
    }
    // Handle Mongoose validation errors
    else if (err.name === "ValidationError") {
        statusCode = StatusCodes.BAD_REQUEST;
        message = "Validation failed";
        data = Object.values(err.errors).map(e => e.message);
    }
    // Handle Mongoose duplicate key errors
    else if (err.code === 11000) {
        statusCode = StatusCodes.CONFLICT;
        message = "Resource already exists";
    }
    // Handle generic errors
    else if (err instanceof Error) {
        message = err.message || message;
    }

    // Log error for debugging (in production, use a proper logging service)
    console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`, err);

    // Send error response
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        data,
    });
};

export default errorHandler;
