import { Router } from "express";
import {
  getAllUsersController,
  getPublicUserController,
} from "../controllers/user.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/all", identifyUser, getAllUsersController);

userRouter.get("/publicUser/:username", identifyUser, getPublicUserController);

export default userRouter;
