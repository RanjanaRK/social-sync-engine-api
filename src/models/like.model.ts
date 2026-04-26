import mongoose from "mongoose";

export enum Emojis {
  LIKE = "like",
  LOVE = "love",
  HAHA = "haha",
  WOW = "wow",
  SAD = "sad",
  ANGRY = "angry",
}

const likeSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      enum: Object.values(Emojis),
      default: "like",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: [true, "post id is required for creating a like"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "username is required for creating a like"],
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const likeModel = mongoose.model("likes", likeSchema);
