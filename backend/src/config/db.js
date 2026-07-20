import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        // Re-throw so server startup fails gracefully
        throw error;
    }
};

export default connectDB;
