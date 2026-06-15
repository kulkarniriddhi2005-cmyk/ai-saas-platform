import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inputText: { type: String, required: true },
    format: { type: String },
    outputText: { type: String, required: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Summary =
  mongoose.models.Summary || mongoose.model("Summary", summarySchema);