import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { createPostController } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

export const postRouter = Router();

postRouter.post("/", upload.single("file"), identifyUser, createPostController);
