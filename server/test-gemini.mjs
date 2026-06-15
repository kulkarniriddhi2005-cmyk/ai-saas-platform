import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { reviewResumeText } from "./utils/gemini.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

try {
  const { text, demo } = await reviewResumeText("John Doe\nSoftware Engineer\n5 years experience");
  console.log("demo:", demo);
  console.log("text:", text.slice(0, 300));
} catch (e) {
  console.error("GEMINI ERROR:", e.message);
  console.error("statusCode:", e.statusCode);
}
