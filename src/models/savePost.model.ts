import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

export const savedPostModel = mongoose.model("savedPosts", savedPostSchema);
