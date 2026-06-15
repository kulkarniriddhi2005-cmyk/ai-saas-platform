import mongoose from "mongoose";

const dataInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dataText: { type: String, required: true },
    focus: { type: String },
    outputText: { type: String, required: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DataInsight =
  mongoose.models.DataInsight || mongoose.model("DataInsight", dataInsightSchema);
