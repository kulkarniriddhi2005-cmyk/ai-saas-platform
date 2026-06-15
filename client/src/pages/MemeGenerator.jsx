import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function MemeGenerator() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("");
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setTop("");
    setBottom("");
    setImageUrl("");
    setImagePrompt("");
    setDemo(false);
    if (!topic.trim()) {
      setError("Enter a topic or joke idea.");
      return;
    }
    setPending(true);
    try {
      const data = await aiApi.generateMeme({
        topic: topic.trim(),
        style: style.trim() || undefined,
      });
      setTop(data.top || "");
      setBottom(data.bottom || "");
      setImageUrl(data.imageUrl || "");
      setImagePrompt(data.imagePrompt || "");
      setDemo(Boolean(data.demo));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">AI meme generator</h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Caption lines are generated with Gemini. A preview image is built from the scene
        description via a public image API (for fun, not guaranteed to match text perfectly).
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="meme-topic">Topic or punchline idea</label>
            <input
              id="meme-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. debugging at 3am"
            />
          </div>
          <div className="form-group">
            <label htmlFor="meme-style">Tone (optional)</label>
            <input
              id="meme-style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. dry humor, wholesome, sarcastic"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Generating…" : "Generate meme"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {pending && (
          <div style={{ marginTop: "1rem" }}>
            <Loader />
          </div>
        )}
        {(top || bottom) && (
          <>
            {demo && (
              <div className="demo-banner" role="status">
                <strong>Demo captions.</strong> Add <code>GEMINI_API_KEY</code> for AI-written top
                and bottom text.
              </div>
            )}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem",
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                textAlign: "center",
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  lineHeight: 1.2,
                }}
              >
                {top}
              </div>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Meme preview"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 8,
                    marginBottom: "0.5rem",
                  }}
                />
              )}
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {bottom}
              </div>
            </div>
            {imagePrompt && (
              <p style={{ marginTop: "0.75rem", color: "var(--muted)", fontSize: "0.85rem" }}>
                Scene hint: {imagePrompt}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
