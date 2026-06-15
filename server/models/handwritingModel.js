import mongoose from "mongoose";

const handwritingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: { type: String },
    mimeType: { type: String },
    transcript: { type: String, required: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Handwriting =
  mongoose.models.Handwriting || mongoose.model("Handwriting", handwritingSchema);
