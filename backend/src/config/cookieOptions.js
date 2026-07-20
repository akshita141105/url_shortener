/**
 * Cookie configuration for secure httpOnly cookies
 * Used for storing authentication tokens
 */
const cookieOptions = {
    httpOnly: true,           // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "Lax",          // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export default cookieOptions;
