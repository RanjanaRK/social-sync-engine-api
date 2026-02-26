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
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
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

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export const users = mongoose.model("users", userSchema);
