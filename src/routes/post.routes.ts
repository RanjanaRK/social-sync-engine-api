import { Router } from "express";
import {
  createCommentController,
  createPostController,
  deleteCommentController,
  deletePostController,
  getAlluserPostsController,
  getCommentPostController,
  getPostsController,
  getSinglePostController,
  likePostController,
  updateCommentController,
  updatePostController,
} from "../controllers/post.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();

postRouter.post(
  "/create",
  upload.array("images", 5),
  identifyUser,
  createPostController,
);

postRouter.get("/get", identifyUser, getPostsController);

postRouter.get("/get/:postId", identifyUser, getSinglePostController);

postRouter.get("/all", identifyUser, getAlluserPostsController);

postRouter.patch("/update/:id", identifyUser, updatePostController);

postRouter.delete("/delete/:postId", identifyUser, deletePostController);

postRouter.post("/like/:postId", identifyUser, likePostController);

postRouter.get(
  "/posts/:postId/comments",
  identifyUser,
  getCommentPostController,
);

postRouter.post(
  "/posts/:postId/comments",
  identifyUser,
  createCommentController,
);

postRouter.delete(
  ":postId/comment/:commentId",
  identifyUser,
  deleteCommentController,
);

postRouter.patch("/comment/:postId", identifyUser, updateCommentController);

export default postRouter;
