import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieOptions from "../config/cookieOptions.js";
import User from "../models/User.js";
import { registerUserService, loginUserService, logoutUserService } from "../services/authService.js";
import { refreshAccessTokenService } from "../services/authService.js";

// Access token needs a shorter lifetime than the refresh token cookie.
// Adjust this to match whatever expiry generateAccessToken() uses (e.g. 15m).
const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
};

export const registerUser = asyncHandler(async (req, res) => {

    const user = await registerUserService(req.body);

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(
            StatusCodes.CREATED,
            "User registered successfully",
            {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        )
    );

});

export const loginUser = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } =
        await loginUserService(req.body);

    res.cookie(
        "refreshToken",
        refreshToken,
        cookieOptions
    );

    res.cookie(
        "accessToken",
        accessToken,
        accessTokenCookieOptions
    );

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Login successful",
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }
        )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", accessTokenCookieOptions);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Logged out successfully",
            null
        )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies.refreshToken;

    const { accessToken, refreshToken } =
        await refreshAccessTokenService(
            incomingRefreshToken
        );

    res.cookie(
        "refreshToken",
        refreshToken,
        cookieOptions
    );

    res.cookie(
        "accessToken",
        accessToken,
        accessTokenCookieOptions
    );

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Token refreshed successfully",
            null
        )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Current user fetched successfully",
            req.user
        )
    );
});