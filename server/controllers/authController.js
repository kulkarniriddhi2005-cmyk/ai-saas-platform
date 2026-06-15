import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";

function signToken(userId) {
  const sub = typeof userId === "string" ? userId : String(userId);
  const secret = process.env.JWT_SECRET?.trim();
  return jwt.sign({ sub }, secret, { expiresIn: "7d" });
}

/** Driver uses MongoServerSelectionError; Mongoose wraps as MongooseServerSelectionError. */
function isMongoUnavailableError(e) {
  if (!e || typeof e !== "object") return false;
  const msg = typeof e.message === "string" ? e.message : "";
  if (
    msg.includes("buffering timed out") ||
    msg.includes("Connection operation buffering timed out")
  ) {
    return true;
  }
  if (msg.includes("before initial connection") && msg.includes("bufferCommands")) {
    return true;
  }
  const n = e.name;
  if (
    n === "MongoServerSelectionError" ||
    n === "MongooseServerSelectionError" ||
    n === "MongoNetworkError" ||
    n === "MongoWaitQueueTimeoutError" ||
    n === "MongoTopologyClosedError"
  ) {
    return true;
  }
  if (e.cause) return isMongoUnavailableError(e.cause);
  return false;
}

function mapWriteError(res, e, fallbackMessage) {
  console.error(fallbackMessage, e);
  if (isMongoUnavailableError(e)) {
    return res.status(503).json({
      message:
        "Database unavailable. Start MongoDB (or fix Atlas IP whitelist / connection string) and verify MONGODB_URI in server/.env.",
    });
  }
  if (e.code === 11000) {
    return res.status(409).json({ message: "Email already registered" });
  }
  if (e.name === "ValidationError") {
    const msg = Object.values(e.errors || {})
      .map((x) => x.message)
      .join(" ");
    return res.status(400).json({ message: msg || "Invalid input" });
  }
  const dev = process.env.NODE_ENV !== "production";
  return res.status(500).json({
    message: fallbackMessage,
    ...(dev && { detail: e.message }),
  });
}

function userResponse(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || "",
  };
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name?.trim() || "",
    });
    const token = signToken(user._id);
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (e) {
    return mapWriteError(res, e, "Registration failed");
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(user._id);
    return res.json({ token, user: userResponse(user) });
  } catch (e) {
    return mapWriteError(res, e, "Login failed");
  }
}

export async function me(req, res) {
  try {
    const id = req.userId;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: userResponse(user) });
  } catch (e) {
    if (e.name === "CastError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (isMongoUnavailableError(e)) {
      return res.status(503).json({
        message:
          "Database unavailable. Start MongoDB (or fix Atlas IP whitelist / connection string) and verify MONGODB_URI in server/.env.",
      });
    }
    console.error(e);
    const dev = process.env.NODE_ENV !== "production";
    return res.status(500).json({
      message: "Failed to load user",
      ...(dev && { detail: e.message }),
    });
  }
}

export async function updateAccount(req, res) {
  try {
    const id = req.userId;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { email, currentPassword, newPassword } = req.body;
    const nextEmail = email?.trim().toLowerCase();
    const nextPassword = newPassword?.trim();

    if (!nextEmail && !nextPassword) {
      return res.status(400).json({ message: "Provide email or password to update" });
    }
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (nextEmail && nextEmail !== user.email) {
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      user.email = nextEmail;
    }

    if (nextPassword) {
      if (nextPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.passwordHash = await User.hashPassword(nextPassword);
    }

    await user.save();
    return res.json({ user: userResponse(user), message: "Account updated successfully" });
  } catch (e) {
    return mapWriteError(res, e, "Failed to update account");
  }
}
