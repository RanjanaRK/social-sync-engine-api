import { Router } from "express";
import { getAllUsersController } from "../controllers/user.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/all", identifyUser, getAllUsersController);

export default userRouter;
