import { Router } from "express";
import {
  deleteUserAccountController,
  getAllUsersController,
  getCurrentUserProfileController,
  getPublicUserController,
  updateProfileImageController,
} from "../controllers/user.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.get("/all", identifyUser, getAllUsersController);

userRouter.get("/profile", identifyUser, getCurrentUserProfileController);

userRouter.get("/:username", identifyUser, getPublicUserController);

userRouter.delete("/:id", identifyUser, deleteUserAccountController);

userRouter.patch(
  "/profile-image",
  identifyUser,
  upload.single("image"),
  updateProfileImageController,
);

export default userRouter;
