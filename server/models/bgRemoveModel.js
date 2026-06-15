import mongoose from "mongoose";

const bgJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bg-remove", "remove-object"], required: true },
    originalFile: { type: String, required: true },
    resultUrl: { type: String, required: true },
    objectDescription: { type: String },
    demo: { type: Boolean, default: false },
    note: { type: String },
  },
  { timestamps: true }
);

export const BgJob =
  mongoose.models.BgJob || mongoose.model("BgJob", bgJobSchema);