import express from "express";
import { Subscriber } from "../models/subscriberModel.js";

const router = express.Router();

// POST /api/subscribers — add a new email subscriber
router.post("/", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Very basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res
        .status(200)
        .json({ ok: true, message: "Already subscribed", duplicate: true });
    }

    const doc = await Subscriber.create({ email });
    return res
      .status(201)
      .json({ ok: true, message: "Subscribed", id: doc._id.toString() });
  } catch (err) {
    console.error("Error creating subscriber", err);
    return res.status(500).json({ message: "Failed to subscribe" });
  }
});

// GET /api/subscribers — list all subscribers (for admin/DB inspection)
router.get("/", async (_req, res) => {
  try {
    const items = await Subscriber.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error("Error listing subscribers", err);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

export default router;

