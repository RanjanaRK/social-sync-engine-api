import { Request, Response } from "express";
import { users } from "../models/user.model.js";
import { posts } from "../models/post.model.js";
import { commentModel } from "../models/comment.model.js";
import { likeModel } from "../models/like.model.js";

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const allUsers = await users.find().lean();

    return res.status(200).json({
      success: true,
      message: "Users fetched",
      data: allUsers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { username, bio, profileImage } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      {
        username,
        bio,
        profileImage,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteUserAccountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const deletedUser = await users.findByIdAndDelete(userId);
    await posts.deleteMany({ user: userId });

    await likeModel.deleteMany({ user: userId });

    await commentModel.deleteMany({ user: userId });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getPublicUserController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await users
      .findOne({ _id: username })
      .select("-password -email ");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userPosts = await posts
      .find({
        user: username,
        visibility: "public",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user,
        posts: userPosts,
      },
    });
  } catch (error) {
    // console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
