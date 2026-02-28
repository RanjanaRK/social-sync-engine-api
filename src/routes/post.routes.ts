import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { identifyUser } from "../middlewares/auth.middleware";
import { createPostController } from "../controllers/post.controller";

export const postRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

postRouter.post("/", upload.single("file"), identifyUser, createPostController);
