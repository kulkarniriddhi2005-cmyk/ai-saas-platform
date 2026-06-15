import { useEffect, useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function HandwritingToText() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult("");
    setDemo(false);
    if (!file) {
      setError("Choose a photo of handwritten notes.");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setPending(true);
    try {
      const data = await aiApi.handwritingToText(formData);
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
      <h1 className="page-title">Handwriting → text</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hw-image">Photo of notes</label>
            <input
              id="hw-image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          {previewUrl && (
            <div style={{ marginBottom: "1rem", maxWidth: 360 }}>
              <img
                src={previewUrl}
                alt="Upload preview"
                style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Reading…" : "Convert to text"}
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
                <strong>Demo mode.</strong> Add <code>GEMINI_API_KEY</code> for real handwriting
                recognition.
              </div>
            )}
            <div className="output-box">{result}</div>
          </>
        )}
      </div>
    </div>
  );
}
