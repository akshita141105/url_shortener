import Url from "../models/Url.js";
import crypto from 'crypto';
import validator from 'validator';
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const Base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function generateShortCode(length = 7) {
    const bytes = crypto.randomBytes(length);
    let code = '';
    
    for (let i = 0; i < length; i++) {
        code += Base62[bytes[i] % Base62.length];
    }
    return code;
}

/**
 * Create a short URL with retry mechanism for unique code generation
 * @param {string} userId - User ID
 * @param {string} originalUrl - Original URL to shorten
 * @param {string} customAlias - Optional custom alias
 * @returns {Promise<Object>} Created URL document
 */
export const createShortUrlService = async (userId, originalUrl, customAlias) => {
    // Validate URL format
    if (!validator.isURL(originalUrl)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid URL format");
    }

    // Check for existing URL for this user
    const existingUrl = await Url.findOne({
        user: userId,
        originalUrl,
    });

    if (existingUrl) {
        return existingUrl;
    }

    // Handle custom alias
    if (customAlias) {
        // Validate custom alias format (alphanumeric and hyphens only)
        if (!/^[a-zA-Z0-9-]{3,20}$/.test(customAlias)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Custom alias must be 3-20 characters and contain only letters, numbers, and hyphens"
            );
        }

        const aliasExists = await Url.findOne({
            shortCode: customAlias,
        });

        if (aliasExists) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Custom alias already exists"
            );
        }

        const url = await Url.create({
            user: userId,
            originalUrl,
            shortCode: customAlias,
        });

        return url;
    }

    // Generate unique short code with retry mechanism
    let shortCode;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        shortCode = generateShortCode();
        
        try {
            const url = await Url.create({
                user: userId,
                originalUrl,
                shortCode,
            });
            return url;
        } catch (err) {
            // If duplicate key error, retry with new code
            if (err.code === 11000) {
                retries++;
                if (retries >= maxRetries) {
                    throw new ApiError(
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        "Failed to generate unique short code after multiple attempts"
                    );
                }
                continue;
            }
            // For other errors, throw immediately
            throw err;
        }
    }
};

/**
 * Get all URLs for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of URL documents
 */
export const getAllUrlsService = async (userId) => {
    return await Url.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });
};

/**
 * Delete a short URL
 * @param {string} userId - User ID
 * @param {string} shortCode - Short code to delete
 * @returns {Promise<Object>} Deleted URL document
 */
export const deleteUrlService = async (userId, shortCode) => {
    const url = await Url.findOneAndDelete({
        shortCode,
        user: userId,
    });

    if (!url) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Short URL not found");
    }
    return url;
};

// Placeholder for future analytics feature
// export const getUrlAnalyticsService = async (userId, shortCode) => {
//     const url = await Url.findOne({
//         shortCode,
//         user: userId,
//     });
//     if (!url) {
//         throw new ApiError(StatusCodes.NOT_FOUND, "Short URL not found");
//     }
//     return url;
// };
