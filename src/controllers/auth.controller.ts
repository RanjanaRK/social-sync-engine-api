import { Request, Response } from "express";
import { users } from "../models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existingEmail) {
      return res.status(409).json({
        message:
          "User already exists " +
          (existingEmail.email == email
            ? "Email already exists"
            : "Username already exists"),
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await users.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User Registered successfully",
      user: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginController = async () => {
  try {
  } catch (error) {}
};

export const logoutController = async () => {
  try {
  } catch (error) {}
};
