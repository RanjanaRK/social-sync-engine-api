import ImageKit, { toFile } from "@imagekit/nodejs";
import { Request, Response } from "express";
import { posts } from "../models/post.model";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

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

    const uploaded = await imagekit.files.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "/posts",
    });

    const post = await posts.create({
      caption: req.body.caption || "",

      postImage: uploaded.url,

      user: user,
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
