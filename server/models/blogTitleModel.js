import mongoose from "mongoose";

const blogTitleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    count: { type: Number },
    text: { type: String, required: true }, // titles text
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BlogTitle =
  mongoose.models.BlogTitle || mongoose.model("BlogTitle", blogTitleSchema);