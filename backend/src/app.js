import express from 'express';
import cors from 'cors';
import urlRoutes from '../src/routes/urlRoutes.js';
import { redirectToOriginalUrl } from './controllers/urlController.js';
import errorHandler from './middlewares/errorMiddleware.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();

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


app.use('/api/urls',urlRoutes);
app.get("/:shortCode",redirectToOriginalUrl);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.get("/",(req,res) => {
    res.json({
        success:true,
        message:"URL Shortener API is running",
    });
});

export default app;