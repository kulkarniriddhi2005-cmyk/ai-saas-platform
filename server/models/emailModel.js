import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    about: { type: String, required: true },
    tone: { type: String },
    recipientContext: { type: String },
    text: { type: String, required: true }, // generated email
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const EmailDoc =
  mongoose.models.EmailDoc || mongoose.model("EmailDoc", emailSchema);