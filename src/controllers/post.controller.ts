import { Request, Response } from "express";
import { posts } from "../models/post.model.js";
import { uploadImage } from "../utils/imageUpload.js";

export const createPostController = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "invalid user" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image required",
      });
    }

    const imageUrl = await uploadImage(req.file);

    const post = await posts.create({
      caption: req.body.caption || "",
      postImage: imageUrl || "",
      user: user.id,
    });

    return res.status(201).json({
      message: "Post created",

      post,
    });
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPostsController = async (req: Request, res: Response) => {
  try {
    const allPosts = await posts.find().populate("user");

    return res.status(200).json({
      message: "Posts fetched",

      allPosts,
    });
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
