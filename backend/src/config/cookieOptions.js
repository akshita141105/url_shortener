const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1 * 24 * 60 * 60 * 1000,
};

export default cookieOptions;