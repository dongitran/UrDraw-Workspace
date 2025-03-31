import mongoose from "mongoose";

let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }
  try {
    if (!Bun.env.MONGO_URI) {
      console.warn("MONGO_URI environment variable not set. MongoDB logging disabled.");
      process.exit();
    }

    await mongoose.connect(Bun.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit();
  }
};

export default { connectToMongoDB, mongoose };
