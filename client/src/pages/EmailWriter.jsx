import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function EmailWriter() {
  const [about, setAbout] = useState("");
  const [tone, setTone] = useState("formal");
  const [recipientContext, setRecipientContext] = useState("");
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!about.trim()) {
      setError("Describe what the email should say.");
      return;
    }
    setPending(true);
    try {
      const data = await aiApi.writeEmail({
        about: about.trim(),
        tone,
        recipientContext: recipientContext.trim() || undefined,
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
      <h1 className="page-title">Email writer</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email-tone">Tone</label>
            <select
              id="email-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email-context">Recipient / context (optional)</label>
            <input
              id="email-context"
              value={recipientContext}
              onChange={(e) => setRecipientContext(e.target.value)}
              placeholder="e.g. Hiring manager at Acme, follow-up after interview"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-about">What should the email cover?</label>
            <textarea
              id="email-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="e.g. Thank them, confirm availability Tuesday 3pm, attach portfolio link"
              rows={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Writing…" : "Generate email"}
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
                <strong>Demo mode.</strong> Add <code>GEMINI_API_KEY</code> for full drafts.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
