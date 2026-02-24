import dotenv from "dotenv";
import app from "./server";
import { db } from "./config/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";

dotenv.config();
db();
app.set("trust proxy", true);
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.listen(5000, () => {
  console.log("server is running okay");
});
