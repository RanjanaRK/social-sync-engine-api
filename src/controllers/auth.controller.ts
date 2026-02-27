import { Request, Response } from "express";
import { users } from "../models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// REGISTRATION
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

// LOGIN
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await users
      .findOne({
        $or: [{ email }, { username }],
      })
      .select("+password");

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "password invalid",
      });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        username: existingUser.username,
        email: existingUser.email,
        bio: existingUser.bio || "",
        profileImage: existingUser.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// LOGOUT

export const logoutController = async () => {
  try {
  } catch (error) {}
};
