import validator from "validator";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import generateTokens from "../utils/generateTokens.js";


export const registerUserService = async ({
    name,
    email,
    password,
}) => {

    if (!name || !email || !password) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "All fields are required"
        );
    }

    if (!validator.isEmail(email)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid email"
        );
    }

    if (!validator.isStrongPassword(password)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Password is not strong enough"
        );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            "User already exists"
        );
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    return user;
};


export const loginUserService = async ({ email, password }) => {
    if (!email || !password) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Email and password are required"
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    const { accessToken, refreshToken } =
        await generateTokens(user._id);

    return {
        user,
        accessToken,
        refreshToken,
    };
};

export const logoutUserService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found"
        );
    }

    user.refreshToken = null;

    await user.save({
        validateBeforeSave: false,
    });

    return true;
};


export const refreshAccessTokenService = async (incomingRefreshToken) => {

    if (!incomingRefreshToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Refresh token missing"
        );
    }

    const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found"
        );
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Refresh token expired or reused"
        );
    }

    const { accessToken, refreshToken } =
        await generateTokens(user._id);

    return {
        accessToken,
        refreshToken,
    };
};