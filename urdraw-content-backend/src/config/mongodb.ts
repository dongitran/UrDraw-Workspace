import mongoose from "mongoose";
require("dotenv").config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

export default connectMongoDB;
