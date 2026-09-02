import { Router } from "express";
import {
  followUserController,
  getFollowCountsController,
  getFollowersController,
  getFollowingController,
  getFollowStatusController,
  removeFollowerController,
  unfollowUserController,
} from "../controllers/follow.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

const followRouter = Router();

followRouter.post("/:username", identifyUser, followUserController);

followRouter.delete(
  "/followers/:username",
  identifyUser,
  removeFollowerController,
);

followRouter.delete("/:username", identifyUser, unfollowUserController);

followRouter.get("/status/:username", identifyUser, getFollowStatusController);

followRouter.get("/counts/:username", identifyUser, getFollowCountsController);

followRouter.get("/followers/:username", identifyUser, getFollowersController);

followRouter.get("/following/:username", identifyUser, getFollowingController);

export default followRouter;
