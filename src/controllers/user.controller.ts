import { Request, Response } from "express";
import { users } from "../models/user.model.js";
import { posts } from "../models/post.model.js";
import { commentModel } from "../models/comment.model.js";
import { likeModel } from "../models/like.model.js";
import { uploadImage } from "../utils/imageUpload.js";

export const getCurrentUserProfileController = async (
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

    const user = await users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userPosts = await posts
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Profile fetched",
      data: {
        user,
        posts: userPosts,
        postsCount: userPosts.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProfileImageController = async (
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // 1. upload to cloud
    const uploadedImage = await uploadImage(req.file);

    // 2. update user in DB
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      {
        profileImage: uploadedImage.url,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Profile image updated",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username } = req.query;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const allUsers = await users
      .find({ username: RegExp(username as string, "i") })
      .select("-email -password")
      .limit(10)
      .lean();

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

    const { username, bio } = req.body;

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
      },
      {
        new: true,
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
    const { username } = req.params as { username: string };

    const user = await users
      .findOne({ username: username })
      .select("-password -email ");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userPosts = await posts
      .find({
        user: user._id,
        visibility: "public",
      })
      .populate("user")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User fetched",
      data: {
        user,
        posts: userPosts,
        postsCount: userPosts.length,
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
