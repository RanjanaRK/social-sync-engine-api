import { Request, Response } from "express";
import { users } from "../models/user.model.js";

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
