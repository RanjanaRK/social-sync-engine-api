import { Router } from "express";
import {
  createPostController,
  getPostsController,
} from "../controllers/post.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();

postRouter.post("/", upload.single("file"), identifyUser, createPostController);

postRouter.get("/get", getPostsController);

export default postRouter;
