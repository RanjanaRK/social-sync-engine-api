import { Request, Response } from "express";

export const createPostController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
  } catch (error) {
    console.error("Post Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
