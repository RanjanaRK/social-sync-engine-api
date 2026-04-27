import { Request, Response } from "express";
import { posts } from "../models/post.model.js";
import { uploadImage } from "../utils/imageUpload.js";
import { imagekit } from "../config/imagekit.js";
import { Emojis, likeModel } from "../models/like.model.js";
import { commentModel } from "../models/comment.model.js";

export const createPostController = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "invalid user" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
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
      success: true,
      message: "Post created",
      data: post,
    });
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getPostsController = async (req: Request, res: Response) => {
  try {
    const allPosts = await posts.find().lean();

    return res.status(200).json({
      success: true,
      message: "Posts fetched",
      data: allPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deletePostController = async (req: Request, res: Response) => {
  const user = req.user;
  const { postId } = req.params;
  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "Post ID is required",
    });
  }

  try {
    const userPost = await posts.findById(postId);
    if (!userPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (userPost.user._id.toString() !== user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const image = userPost.postImage?.[0];

    if (image?.fileId) {
      await imagekit.files.delete(image.fileId);
    }

    await Promise.all([
      posts.findByIdAndDelete(postId),
      likeModel.deleteMany({ post: postId }),
      commentModel.deleteMany({ post: postId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      success: false,
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
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const post = await posts.findByIdAndUpdate(
      postId,
      { caption },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Post updated",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSinglePostController = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await posts.findById(postId).lean();
    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const likePostController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { postId } = req.params as { postId: string };

    const { emoji } = req.body as { emoji: Emojis };

    const existingPost = await posts.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existingLike = await likeModel.findOne({
      post: postId,
      user: userId,
    });

    if (existingLike) {
      if (existingLike.emoji === emoji) {
        await likeModel.deleteOne({ _id: existingLike._id });

        await posts.findByIdAndUpdate(
          postId,
          { _id: postId, likesCount: { $gt: 0 } },
          { $inc: { likesCount: -1 } },
        );

        return res.status(200).json({
          success: true,
          message: "Reaction removed",
        });
      }

      existingLike.emoji = emoji;
      await existingLike.save();
      return res.status(200).json({
        success: true,
        message: "Reaction updated",
      });
    }
    await likeModel.create({
      emoji,
      post: postId,
      user: userId,
    });

    await posts.findByIdAndUpdate(postId, {
      $inc: {
        likesCount: 1,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Reaction added",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCommentPostController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { postId } = req.params as { postId: string };

    const existingPost = await posts.findById(postId);

    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await commentModel.find({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Comments fetched",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const createCommentController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params as { postId: string };
    const { comment } = req.body as { comment: string };

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post id is required",
      });
    }

    const existingPost = await posts.findById(postId);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = await commentModel.create({
      comment,
      post: postId,
      user: userId,
    });

    await posts.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    return res.status(201).json({
      success: true,
      message: "Comment added",
      data: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
