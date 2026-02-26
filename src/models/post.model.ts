import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      trim: true,
      maxlength: [1000, "Caption cannot exceed 1000 characters"],
      default: "",
    },
    postImage: {
      type: String,
      trim: true,
      required: [true, "imgUrl is required for creating an post"],
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "user id is required for creating an post"],
    },
  },
  { timestamps: true },
);

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const posts = mongoose.model("posts", postSchema);
