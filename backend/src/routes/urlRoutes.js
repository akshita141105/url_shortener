import express from 'express';
import {
    createShortUrl,
    getAllUrls,
    deleteUrl
} from '../controllers/urlController.js';
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateUrlCreation } from '../middlewares/validationMiddleware.js';
import { createUrlLimiter, getUrlsLimiter } from '../middlewares/rateLimiter.js';


const router = express.Router();

// Protected routes - require authentication
router.post("/", authMiddleware, createUrlLimiter, validateUrlCreation, createShortUrl);
router.get("/", authMiddleware, getUrlsLimiter, getAllUrls);
router.delete("/:shortCode", authMiddleware, deleteUrl);

// Analytics endpoint (placeholder for future implementation)
// router.get("/:shortCode/analytics", authMiddleware, getUrlAnalytics);

export default router;
