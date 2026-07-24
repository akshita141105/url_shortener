/**
 * Cookie configuration for secure httpOnly cookies
 * Used for storing authentication tokens
 *
 * In production (cross-origin deployment), sameSite must be "None" and
 * secure must be true, otherwise the browser will refuse to send cookies
 * on cross-site requests (e.g. Vercel frontend → Render backend).
 */
const isProduction = process.env.NODE_ENV === "production";

console.log("=== DEBUG: NODE_ENV is:", process.env.NODE_ENV, "| isProduction:", isProduction, "===");

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export default cookieOptions;

