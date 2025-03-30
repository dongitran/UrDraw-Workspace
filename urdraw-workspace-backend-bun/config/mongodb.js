require("dotenv").config();
const mongoose = require("mongoose");

let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.warn(
        "MONGO_URI environment variable not set. MongoDB logging disabled."
      );
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = { connectToMongoDB, mongoose };
