import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function ResumeReview() {
  const [pdfFile, setPdfFile] = useState(null);
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!pdfFile) {
      setError("Upload your resume PDF.");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      const data = await aiApi.reviewResumePdf(fd);
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
      <h1 className="page-title">Resume review</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resume-pdf">Upload your resume PDF</label>
            <input
              id="resume-pdf"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Reviewing…" : "Get feedback"}
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
              <div className="demo-banner" role="status">
                <strong>Demo mode.</strong> For real AI resume feedback, get a key from{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
                , add <code>GEMINI_API_KEY=…</code> to <code>server/.env</code>, then restart the
                API.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
