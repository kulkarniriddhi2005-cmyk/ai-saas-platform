import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function BlogTitles() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!topic.trim()) {
      setError("Enter a topic.");
      return;
    }
    setPending(true);
    try {
      const data = await aiApi.generateTitles({
        topic: topic.trim(),
        count: Number(count) || 8,
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
      <h1 className="page-title">Blog title ideas</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title-topic">Topic</label>
            <input
              id="title-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. sustainable travel on a budget"
            />
          </div>
          <div className="form-group">
            <label htmlFor="title-count">Number of titles (3–15)</label>
            <input
              id="title-count"
              type="number"
              min={3}
              max={15}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Generating…" : "Generate titles"}
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
                <strong>Demo mode.</strong> Add <code>GEMINI_API_KEY</code> for AI title ideas.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
