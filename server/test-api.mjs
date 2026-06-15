import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = "http://127.0.0.1:5001/api";

const email = `test500_${Date.now()}@example.com`;
const { data: reg } = await axios.post(`${base}/auth/register`, {
  name: "Test",
  email,
  password: "testpass123",
});
const token = reg.token;
console.log("Registered, token ok");

const pdfPath = path.join(__dirname, "uploads", "test-sample.pdf");
const form = new FormData();
form.append("pdf", fs.createReadStream(pdfPath), {
  filename: "resume.pdf",
  contentType: "application/pdf",
});

try {
  const start = Date.now();
  const { data, status } = await axios.post(`${base}/ai/resume/pdf`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
    maxBodyLength: Infinity,
    timeout: 180000,
  });
  console.log("Status:", status, "in", Date.now() - start, "ms");
  console.log("Demo:", data.demo);
  console.log("Text preview:", (data.text || "").slice(0, 200));
} catch (e) {
  console.error("FAILED status:", e.response?.status);
  console.error("Message:", e.response?.data?.message || e.message);
}
