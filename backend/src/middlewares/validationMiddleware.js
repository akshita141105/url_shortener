import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";

/**
 * Middleware to validate URL creation request body
 */
export const validateUrlCreation = (req, res, next) => {
    const { originalUrl, customAlias } = req.body;

    // Check if originalUrl is provided
    if (!originalUrl) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "originalUrl is required"
        );
    }

    // Check if originalUrl is a string
    if (typeof originalUrl !== 'string') {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "originalUrl must be a string"
        );
    }

    // Check if originalUrl is a valid URL
    if (!validator.isURL(originalUrl)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "originalUrl must be a valid URL"
        );
    }

    // Validate customAlias if provided
    if (customAlias) {
        if (typeof customAlias !== 'string') {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "customAlias must be a string"
            );
        }

        if (!/^[a-zA-Z0-9-]{3,20}$/.test(customAlias)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "customAlias must be 3-20 characters and contain only letters, numbers, and hyphens"
            );
        }
    }

    next();
};
