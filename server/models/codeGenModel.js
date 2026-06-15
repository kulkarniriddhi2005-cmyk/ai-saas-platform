import mongoose from "mongoose";

const codeGenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    language: { type: String },
    algorithmText: { type: String, required: true },
    codeText: { type: String, required: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CodeGen =
  mongoose.models.CodeGen || mongoose.model("CodeGen", codeGenSchema);
