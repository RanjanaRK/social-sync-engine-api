import { Router } from "express";
import {
  createPostController,
  deletePostController,
  getCommentPostController,
  getPostsController,
  getSinglePostController,
  likePostController,
  updatePostController,
} from "../controllers/post.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();

postRouter.post("/", upload.single("file"), identifyUser, createPostController);

postRouter.get("/get", getPostsController);

postRouter.get("/get/:id", getSinglePostController);

postRouter.patch("/update/:id", identifyUser, updatePostController);

postRouter.delete("/delete/:id", identifyUser, deletePostController);

postRouter.post("/like/:postId", identifyUser, likePostController);

postRouter.get("/comment/:postId", getCommentPostController);

export default postRouter;
