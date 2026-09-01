import { Router } from "express";
import {
  followUserController,
  getFollowCountsController,
  getFollowStatusController,
  unfollowUserController,
} from "../controllers/follow.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

const followRouter = Router();

followRouter.post("/:username", identifyUser, followUserController);

followRouter.delete("/:username", identifyUser, unfollowUserController);

followRouter.get("/status/:username", identifyUser, getFollowStatusController);

followRouter.get("/counts/:username", getFollowCountsController);

export default followRouter;
