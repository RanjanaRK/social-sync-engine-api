import mongoose from "mongoose";

export const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (error) {
    console.error("DB Error:", error);
    process.exit(1);
  }
};
