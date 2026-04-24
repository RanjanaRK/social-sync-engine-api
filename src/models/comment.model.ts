import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    posts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ posts: 1, user: 1 }, { unique: true });

export const commentModel = mongoose.model("comments", commentSchema);
