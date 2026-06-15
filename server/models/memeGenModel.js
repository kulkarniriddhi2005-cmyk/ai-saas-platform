import mongoose from "mongoose";

const memeGenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    style: { type: String },
    top: { type: String, required: true },
    bottom: { type: String, required: true },
    imagePrompt: { type: String },
    imageUrl: { type: String },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MemeGen =
  mongoose.models.MemeGen || mongoose.model("MemeGen", memeGenSchema);
