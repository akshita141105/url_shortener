import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Access token is required"
        );
    }

    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User not found"
        );
    }

    req.user = user;

    next();
});

export default authMiddleware;