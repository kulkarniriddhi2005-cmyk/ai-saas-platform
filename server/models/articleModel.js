import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    tone: { type: String },
    text: { type: String, required: true }, // generated article
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Article =
  mongoose.models.Article || mongoose.model("Article", articleSchema);