import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transcript: { type: String, required: true },
    mimeType: { type: String },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Transcription =
  mongoose.models.Transcription ||
  mongoose.model("Transcription", transcriptionSchema);
