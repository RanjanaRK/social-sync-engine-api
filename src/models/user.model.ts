import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "user name already exists"],
    required: [true, "User name is required"],
  },
  email: {
    type: String,
    unique: [true, "email already exists"],
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },

  bio: {
    type: String,
  },
  profileImage: {
    type: String,
  },
});

export const userModel = mongoose.model("users", userSchema);
