import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/auth.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";
import { getCurrentUserProfileController } from "../controllers/user.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", identifyUser, );
