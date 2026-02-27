import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: [true, "user name already exists"],
      required: [true, "User name is required"],
    },
    email: {
      type: String,
      unique: [true, "email already exists"],
      required: [true, "email is required"],
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    bio: {
      type: String,
      maxlength: 200,
    },
    profileImage: {
      type: String,
      default: "/default.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

export const users = mongoose.model("users", userSchema);
