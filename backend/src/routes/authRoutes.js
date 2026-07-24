import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
} from "../controllers/authController.js";
import { authLimiter, refreshLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public Routes
router.post("/login", authLimiter, loginUser);
router.post("/register", authLimiter, registerUser);
router.post("/refresh", refreshLimiter, refreshAccessToken);

// Protected Routes
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);

export default router;