import mongoose from "mongoose";

const resumeReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inputText: { type: String, required: true },
    outputText: { type: String, required: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ResumeReview =
  mongoose.models.ResumeReview ||
  mongoose.model("ResumeReview", resumeReviewSchema);