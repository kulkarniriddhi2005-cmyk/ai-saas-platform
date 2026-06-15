import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setAlgorithm("");
    setCode("");
    setDemo(false);
    if (!prompt.trim()) {
      setError("Describe what code you need.");
      return;
    }
    setPending(true);
    try {
      const data = await aiApi.generateCode({
        prompt: prompt.trim(),
        language: language.trim() || undefined,
      });
      setAlgorithm(data.algorithm || "");
      setCode(data.code || "");
      setDemo(Boolean(data.demo));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setPending(false);
    }
  }

  const hasResult = algorithm || code;

  return (
    <div>
      <h1 className="page-title">AI code generator</h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Each response is split into <strong>algorithm</strong> (approach & pseudocode) and{" "}
        <strong>code</strong> (implementation).
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code-prompt">What should the code do?</label>
            <textarea
              id="code-prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Express route that validates email and returns JWT"
            />
          </div>
          <div className="form-group">
            <label htmlFor="code-lang">Language / stack (optional)</label>
            <input
              id="code-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. TypeScript, React, Python"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Generating…" : "Generate"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {pending && (
          <div style={{ marginTop: "1rem" }}>
            <Loader />
          </div>
        )}
        {hasResult && (
          <>
            {demo && (
              <div className="demo-banner" role="status">
                <strong>Demo mode.</strong> Add{" "}
                <code>GEMINI_API_KEY</code> in <code>server/.env</code> for full AI algorithm +
                code.{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get a key
                </a>
                .
              </div>
            )}
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
                alignItems: "stretch",
              }}
            >
              <div>
                <h2 style={{ fontSize: "0.85rem", margin: "0 0 0.5rem", color: "var(--muted)" }}>
                  Algorithm
                </h2>
                <pre
                  className="output-box"
                  style={{
                    margin: 0,
                    minHeight: 200,
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                  }}
                >
                  {algorithm || "—"}
                </pre>
              </div>
              <div>
                <h2 style={{ fontSize: "0.85rem", margin: "0 0 0.5rem", color: "var(--muted)" }}>
                  Code
                </h2>
                <pre
                  className="output-box"
                  style={{
                    margin: 0,
                    minHeight: 200,
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                  }}
                >
                  {code || "—"}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
