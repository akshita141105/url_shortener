import express from 'express'
import {
    createShortUrl,
    getAllUrls,
    deleteUrl,
    // getUrlAnalytics,
    redirectToOriginalUrl
} from '../controllers/urlController.js';
import errorHandler from '../middlewares/errorMiddleware.js';
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/", authMiddleware, createShortUrl);

router.get("/", authMiddleware, getAllUrls);

router.delete(
    "/:shortCode",
    authMiddleware,
    deleteUrl
);

// router.get(
//     "/:shortCode/analytics",
//     authMiddleware,
//     getUrlAnalytics
// );
// router.get("/:shortCode", redirectToOriginalUrl);

export default router;
