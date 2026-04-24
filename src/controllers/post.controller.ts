import { Request, Response } from "express";
import { posts } from "../models/post.model.js";
import { uploadImage } from "../utils/imageUpload.js";
import { imagekit } from "../config/imagekit.js";
import { likeModel } from "../models/like.model.js";

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

    const uploadedImage = await uploadImage(req.file);

    const post = await posts.create({
      caption: req.body.caption || "",
      postImage: [
        {
          url: uploadedImage.url,
          fileId: uploadedImage.fileId,
        },
      ],

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
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deletePostController = async (req: Request, res: Response) => {
  const user = req.user;
  const { postId } = req.params;

  try {
    const userPost = await posts.findById(postId);
    if (!userPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (userPost.user._id.toString() !== user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const image = userPost.postImage?.[0];

    if (image?.fileId) {
      await imagekit.files.delete(image.fileId);
    }

    const post = await posts.findByIdAndDelete(postId);

    return res.status(200).json({
      message: "Post deleted",
      post,
    });
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updatePostController = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { caption } = req.body;

  try {
    const userPost = await posts.findById(postId);
    if (!userPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await posts.findByIdAndUpdate(
      postId,
      { caption },
      { new: true },
    );

    return res.status(200).json({
      message: "Post updated",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSinglePostController = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.id;
  try {
    const post = await posts.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    const isValidUser = post.user.toString() === userId;

    if (!isValidUser) {
      return res.status(403).json({
        message: "Forbidden Content.",
      });
    }

    return res.status(200).json({
      message: "Post fetched",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const likePostController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { postId } = req.params as { postId: string };

    const existingPost = await posts.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const existingLike = await likeModel.findOne({
      postId,
      userId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};
