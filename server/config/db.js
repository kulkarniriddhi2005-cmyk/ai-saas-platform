import mongoose from "mongoose";

export async function connectDb(uri) {
  mongoose.set("strictQuery", true);
  /** No queue when disconnected — avoids 10s "buffering timed out" on every auth request. */
  mongoose.set("bufferCommands", false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
}
