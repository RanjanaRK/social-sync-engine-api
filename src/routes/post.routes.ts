import { Router } from "express";
import { createPostController } from "../controllers/post.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const postRouter = Router();

postRouter.post("/", upload.single("file"), identifyUser, createPostController);
