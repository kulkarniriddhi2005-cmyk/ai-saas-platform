import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function extractTextFromPdf(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  try {
    if (!globalThis.__pdfParseWorkerSet) {
      const workerUrl = "pdfjs-dist/legacy/build/pdf.worker.mjs";
      PDFParse.setWorker(workerUrl);
      globalThis.__pdfParseWorkerSet = true;
    }
  } catch (e) {
    console.warn("setWorker failed:", e.message);
  }
  const parser = new PDFParse({ data: buf });
  try {
    const data = await parser.getText();
    return data?.text || "";
  } finally {
    try {
      await parser.destroy?.();
    } catch {}
  }
}

async function test(label, pdfPath) {
  try {
    const text = await extractTextFromPdf(pdfPath);
    console.log(`[${label}] SUCCESS, text length:`, text.length);
    console.log("Preview:", text.slice(0, 120));
  } catch (e) {
    console.error(`[${label}] FAILED:`, e.message);
  }
}

// Download bitcoin.pdf for local buffer test
const testPdf = path.join(__dirname, "uploads", "test-sample.pdf");
if (!fs.existsSync(testPdf) || !fs.readFileSync(testPdf, "utf8").startsWith("%PDF")) {
  const res = await fetch("https://bitcoin.org/bitcoin.pdf", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(testPdf, buf);
  console.log("Downloaded test PDF, size:", buf.length, "magic:", buf.slice(0, 5).toString());
}

await test("local file", testPdf);

// Test without custom worker
async function extractNoWorker(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const data = await parser.getText();
    return data?.text || "";
  } finally {
    await parser.destroy?.();
  }
}

try {
  const text = await extractNoWorker(testPdf);
  console.log("[no worker] SUCCESS, text length:", text.length);
} catch (e) {
  console.error("[no worker] FAILED:", e.message);
}

// Test URL mode (no worker override)
try {
  const parser = new PDFParse({ url: "https://bitcoin.org/bitcoin.pdf" });
  const data = await parser.getText();
  console.log("[url mode] SUCCESS, text length:", data.text?.length);
  await parser.destroy?.();
} catch (e) {
  console.error("[url mode] FAILED:", e.message);
}
