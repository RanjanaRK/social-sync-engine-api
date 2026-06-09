import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", identifyUser, meController);
