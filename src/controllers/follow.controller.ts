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

export const getFollowStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { username } = req.params as { username: string };
    const loggedInUser = req.user as JwtUser;

    // Find profile user
    const followee = await users.findOne({ username });

    if (!followee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if logged-in user follows this user
    const existingFollow = await followModel.findOne({
      follower: loggedInUser.id,
      followee: followee._id.toString(),
    });

    return res.status(200).json({
      success: true,
      data: {
        isFollowing: !!existingFollow,
      },
    });
  } catch (error) {
    console.error("Follow status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get follow status",
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

export const getFollowersController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const follows = await followModel
      .find({
        followee: user._id.toString(),
      })
      .sort({ createdAt: -1 });

    const followerIds = follows.map((follow) => follow.follower);

    const followerUsers = await users
      .find({
        _id: { $in: followerIds },
      })
      .select("username profileImage bio");

    return res.status(200).json({
      success: true,
      data: followerUsers,
    });
  } catch (error) {
    console.error("Get followers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get followers",
    });
  }
};

export const getFollowingController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const follows = await followModel
      .find({
        follower: user._id.toString(),
      })
      .sort({ createdAt: -1 });

    const followingIds = follows.map((follow) => follow.followee);

    const followingUsers = await users
      .find({
        _id: { $in: followingIds },
      })
      .select("username profileImage bio");

    return res.status(200).json({
      success: true,
      data: followingUsers,
    });
  } catch (error) {
    console.error("Get following error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get following",
    });
  }
};

export const removeFollowerController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };

    const loggedInUser = req.user as JwtUser;

    const followerUser = await users.findOne({ username });

    if (!followerUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const removeFollower = await followModel.findByIdAndDelete({
      follower: followerUser._id.toString(),
      followee: loggedInUser.id,
    });

    if (!removeFollower) {
      return res.status(400).json({
        success: false,
        message: "This user is not following you",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Removed ${followerUser.username} from your followers`,
    });
  } catch (error) {
    console.error("Remove follower error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove follower",
    });
  }
};
