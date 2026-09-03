import { Request, Response } from "express";
import { imagekit } from "../config/imagekit.js";
import { commentModel } from "../models/comment.model.js";
import { Emojis, likeModel } from "../models/like.model.js";
import { posts } from "../models/post.model.js";
import { uploadImage } from "../utils/imageUpload.js";
import mongoose from "mongoose";
import { JwtUser } from "./follow.controller.js";
import { savedPostModel } from "../models/savePost.model.js";

export const createPostController = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "invalid user" });
  }

  try {
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploaded = await uploadImage(file);

        return {
          url: uploaded.url,
          fileId: uploaded.fileId,
        };
      }),
    );

    const post = await posts.create({
      caption: req.body.caption || "",
      postImage: uploadedImages,
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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Get all posts
    const allPosts = await posts
      .find()
      .populate("user")
      .sort({ createdAt: -1 })
      .lean();

    // Get current user's reactions
    const userLikes = await likeModel
      .find({
        user: userId,
      })
      .lean();

    // Get current user's saved posts
    const savedPosts = await savedPostModel
      .find({
        user: userId,
      })
      .lean();

    // Map reactions by post ID
    const likeMap = new Map(
      userLikes.map((like) => [like.post.toString(), like]),
    );

    // Store saved post IDs
    const savedPostIds = new Set(
      savedPosts.map((saved) => saved.post.toString()),
    );

    // Add user-specific status
    const postsWithStatus = allPosts.map((post) => {
      const reaction = likeMap.get(post._id.toString());

      return {
        ...post,

        // Reaction
        isLiked: !!reaction,

        userReaction: reaction?.emoji ?? null,

        // Save
        isSaved: savedPostIds.has(post._id.toString()),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Posts fetched",
      data: postsWithStatus,
    });
  } catch (error) {
    console.error("Get posts error:", error);

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
      return res.status(403).json({ success: false, message: "forbidden" });
    }
    const image = userPost.postImage?.[0];

    if (image?.fileId) {
      await imagekit.files.delete(image.fileId);
    }

    await posts.findByIdAndDelete(postId);
    await commentModel.deleteMany({ post: postId });
    await likeModel.deleteMany({ post: postId });

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

export const getAlluserPostsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userPosts = await posts
      .find({ user: userId })
      .sort({ createdAt: 1 })
      .lean();
    const totalPosts = await posts.countDocuments({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Posts fetched",
      data: userPosts,
      meta: {
        totalPosts,
      },
    });
  } catch (error) {
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

    // Remove reaction
    if (existingLike) {
      if (existingLike.emoji === emoji) {
        await likeModel.deleteOne({
          _id: existingLike._id,
        });

        await posts.findOneAndUpdate(
          {
            _id: postId,
            likesCount: { $gt: 0 },
          },
          {
            $inc: {
              likesCount: -1,
            },
          },
        );

        return res.status(200).json({
          success: true,
          message: "Reaction removed",
          isLiked: false,
          userReaction: null,
        });
      }

      // Change reaction
      await likeModel.findByIdAndUpdate(
        existingLike._id,
        {
          emoji,
        },
        {
          new: true,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Reaction updated",
        isLiked: true,
        userReaction: emoji,
      });
    }

    // Create reaction
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
      isLiked: true,
      userReaction: emoji,
    });
  } catch (error) {
    console.error("Like post error:", error);

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

    const comments = await commentModel
      .find({ post: postId })
      .populate("user")
      .select("-password -email")
      .lean();

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

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
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
      comment: comment.trim(),
      post: new mongoose.Types.ObjectId(postId),
      user: new mongoose.Types.ObjectId(userId),
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
    console.error("Create Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteCommentController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { commentId, postId } = req.params as {
      commentId: string;
      postId: string;
    };

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment id is required",
      });
    }
    const existingComment = await commentModel.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    await existingComment.deleteOne();
    await posts.updateOne(
      {
        _id: existingComment.post,
        commentsCount: { $gt: 0 },
      },
      {
        $inc: { commentsCount: -1 },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};

export const updateCommentController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params as { commentId: string };
    const { comment } = req.body as { comment: string };

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment id is required",
      });
    }

    const existingComment = await commentModel.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated",
      data: updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};

export const createSavePostController = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser;
    const { postId } = req.params as { postId: string };

    const post = await posts.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existingSavedPost = await savedPostModel.findOne({
      user: user.id,
      post: postId,
    });

    if (existingSavedPost) {
      await savedPostModel.deleteOne({
        _id: existingSavedPost._id,
      });

      return res.status(200).json({
        success: true,
        message: "Post removed from saved posts",
        isSaved: false,
      });
    }

    await savedPostModel.create({
      user: user.id,
      post: postId,
    });

    return res.status(201).json({
      success: true,
      message: "Post saved",
      isSaved: true,
    });
  } catch (error) {
    console.error(" save post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSavedPostsController = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser;

    const savedPosts = await savedPostModel
      .find({
        user: user.id,
      })
      .populate({
        path: "post",
        populate: {
          path: "user",
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    const data = savedPosts
      .filter((saved) => saved.post)
      .map((saved) => ({
        ...saved.post,

        isSaved: true,
      }));

    return res.status(200).json({
      success: true,
      message: "Saved posts fetched",
      data,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
