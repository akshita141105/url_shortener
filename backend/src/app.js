import express from 'express';
import cors from 'cors';
import urlRoutes from '../src/routes/urlRoutes.js';
import { redirectToOriginalUrl } from './controllers/urlController.js';
import errorHandler from './middlewares/errorMiddleware.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { redirectLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://url-shortener-chi-drab.vercel.app",
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "URL Shortener API is running",
    });
});

// API Routes
app.use('/api/urls', urlRoutes);
app.use("/api/auth", authRoutes);

// Redirect route (must be last to avoid conflicts)
app.get("/:shortCode", redirectLimiter, redirectToOriginalUrl);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
