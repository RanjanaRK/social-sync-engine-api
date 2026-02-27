import bcrypt from "bcryptjs";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { users } from "../models/user.model";

// CONFIG
const TOKEN_NAME = "token";

const isProd = process.env.NODE_ENV === "production";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const SALT_ROUNDS: number = Number(process.env.BCRYPT_ROUNDS) || 10;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

//  REGISTER

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

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
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie(TOKEN_NAME, token, cookieOptions);

    return res.status(201).json({
      message: "User Registered successfully",
      user: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGIN

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        message: "Email or Username and password required",
      });
    }

    const user = await users
      .findOne({
        $or: [{ email }, { username }],
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie(TOKEN_NAME, token, cookieOptions);

    return res.status(200).json({
      message: "User logged in successfully",

      user: {
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//  LOGOUT

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie(TOKEN_NAME, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,

      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
