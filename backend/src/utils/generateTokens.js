import User from "../models/User.js";
import ApiError from "./ApiError.js";
import { StatusCodes } from "http-status-codes";

const generateTokens = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found"
        );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false,
    });

    return {
        accessToken,
        refreshToken,
    };
};

export default generateTokens;