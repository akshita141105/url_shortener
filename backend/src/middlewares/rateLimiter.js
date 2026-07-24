import rateLimit from "express-rate-limit";

// Login/Register - prevent brute force & spam signups
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many attempts. Please try again after 15 minutes.",
        data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Refresh - legit apps refresh often, so looser
export const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many refresh attempts. Please try again later.",
        data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// URL creation - prevent spam short-link generation
export const createUrlLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many URLs created. Slow down a bit.",
        data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public redirect endpoint - most exposed to abuse/bots since no auth required
export const redirectLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60, // 60 redirects per minute per IP - generous for real users
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests. Please slow down.",
        data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Getting URL list - light protection against scraping
export const getUrlsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests. Please slow down.",
        data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
});