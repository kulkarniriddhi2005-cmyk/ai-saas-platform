import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function DataInsights() {
  const [dataText, setDataText] = useState("");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!dataText.trim()) {
      setError("Paste numbers, a table, or describe your chart.");
      return;
    }
    setPending(true);
    try {
      const data = await aiApi.dataInsights({
        dataText: dataText.trim(),
        focus: focus.trim() || undefined,
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
      <h1 className="page-title">Data & chart insights</h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Paste CSV-like data, key metrics, or describe a chart. The AI explains trends and
        caveats in plain language.
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="data-text">Data or chart description</label>
            <textarea
              id="data-text"
              rows={10}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder={`Q1: 120\nQ2: 95\nQ3: 140\nQ4: 160\n\nOr: "Bar chart of sales by region; West is highest…"`}
            />
          </div>
          <div className="form-group">
            <label htmlFor="focus">Focus (optional)</label>
            <input
              id="focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. year-over-year growth, outliers"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Analyzing…" : "Get insights"}
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
                <strong>Demo mode.</strong> Set <code>GEMINI_API_KEY</code> for deeper analysis.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
