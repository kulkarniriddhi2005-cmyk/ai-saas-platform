import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function TextSummary() {
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [format, setFormat] = useState("paragraph");
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!pdfFile && !text.trim()) {
      setError("Paste or type text to summarize or upload a PDF.");
      return;
    }
    setPending(true);
    try {
      const data = pdfFile
        ? await aiApi.summarizePdf(
            (() => {
              const fd = new FormData();
              fd.append("pdf", pdfFile);
              fd.append("format", format);
              return fd;
            })()
          )
        : await aiApi.summarizeText({
            text: text.trim(),
            format,
          });
      setResult(data.text || "");
      setDemo(Boolean(data.demo));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Text summary</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="summary-pdf">Upload PDF (optional)</label>
            <input
              id="summary-pdf"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sum-text">Text</label>
            <textarea
              id="sum-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste article, notes, or any text…"
              rows={10}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sum-format">Format</label>
            <select
              id="sum-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="paragraph">Short paragraphs</option>
              <option value="bullet">Bullet points</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Summarizing…" : "Summarize"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {pending && (
          <div style={{ marginTop: "1rem" }}>
            <Loader />
          </div>
        )}
        {result && (
          <>
            {demo && (
              <div className="demo-banner" role="status" style={{ marginTop: "1rem" }}>
                <strong>Demo mode.</strong> Add <code>GEMINI_API_KEY</code> in{" "}
                <code>server/.env</code> for real summaries.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
