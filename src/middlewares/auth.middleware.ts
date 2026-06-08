import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

export const identifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided, Unauthorized access",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "user not authorized",
    });
  }
};
