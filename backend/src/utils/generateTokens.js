/**
 * Token generation utility for creating JWT tokens
 * Stores refresh token in database for token rotation validation
 */
import User from "../models/User.js";

/**
 * Generate access and refresh tokens for a user
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
const generateTokens = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in database for validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export default generateTokens;
