import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { authRouter } from "./routes/auth.routes.js";
import { db } from "./config/db.js";
import app from "./server.js";
import postRouter from "./routes/post.routes.js";
import userRouter from "./routes/user.routes.js";

db();

app.set("trust proxy", true);
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  console.log("server is running okay");
});
