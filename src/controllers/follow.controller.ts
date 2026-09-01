import { Request, Response } from "express";
import { users } from "../models/user.model.js";
import { followModel } from "../models/follow.model.js";

interface JwtUser {
  id: string;
}

export const followUserController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };
    const loggedInUser = req.user as JwtUser;

    // Find user being followed
    const followee = await users.findOne({ username });

    if (!followee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-follow
    if (loggedInUser.id === followee._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check existing follow
    const existingFollow = await followModel.findOne({
      follower: loggedInUser.id,
      followee: followee._id.toString(),
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "You already follow this user",
      });
    }

    const follow = await followModel.create({
      follower: loggedInUser.id,
      followee: followee._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: `You are now following ${followee.username}`,
      data: follow,
    });
  } catch (error) {
    console.error("Follow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
};

export const unfollowUserController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };
    const loggedInUser = req.user as JwtUser;

    const followee = await users.findOne({ username });

    if (!followee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deletedFollow = await followModel.findOneAndDelete({
      follower: loggedInUser.id,
      followee: followee._id.toString(),
    });

    if (!deletedFollow) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: `You unfollowed ${followee.username}`,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
};

export const getFollowCountsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { username } = req.params as { username: string };

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = user._id.toString();

    const [followers, following] = await Promise.all([
      followModel.countDocuments({
        followee: userId,
      }),

      followModel.countDocuments({
        follower: userId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        followers,
        following,
      },
    });
  } catch (error) {
    console.error("Follow counts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get follow counts",
    });
  }
};
