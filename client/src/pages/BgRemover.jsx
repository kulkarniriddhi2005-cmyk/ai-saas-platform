import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

export default function BgRemover() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [demo, setDemo] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResultUrl("");
    setDemo(false);
    setMessage("");
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResultUrl("");
    setDemo(false);
    setMessage("");
    if (!file) {
      setError("Choose an image.");
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    setPending(true);
    try {
      const data = await aiApi.removeBackground(fd);
      if (data.resultUrl) {
        const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
        setResultUrl(
          data.resultUrl.startsWith("http")
            ? data.resultUrl
            : `${base}${data.resultUrl}`
        );
      }
      setDemo(Boolean(data.demo));
      if (data.message) setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Background remover</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="img">Image</label>
            <input
              id="img"
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="Original" className="preview-img" />
          )}
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Processing…" : "Remove background"}
            </button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
        {message && (
          <p style={{ color: "var(--muted)", marginTop: "0.75rem" }}>{message}</p>
        )}
        {pending && (
          <div style={{ marginTop: "1rem" }}>
            <Loader />
          </div>
        )}
        {resultUrl && (
          <>
            {demo && (
              <div className="demo-banner" role="status" style={{ marginTop: "1rem" }}>
                <strong>Demo mode.</strong> The file below is your original upload. For real
                background removal, sign up at{" "}
                <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer">
                  remove.bg
                </a>{" "}
                and set <code>REMOVEBG_API_KEY</code> in <code>server/.env</code>, then restart
                the API.
              </div>
            )}
            <p style={{ marginTop: "1rem", fontWeight: 600 }}>
              {demo ? "Preview (unchanged in demo)" : "Result"}
            </p>
            <img
              src={resultUrl}
              alt={demo ? "Original upload" : "Background removed"}
              className="preview-img"
            />
            <div style={{ marginTop: "0.75rem" }}>
              <a href={resultUrl} download className="btn btn-ghost">
                Download
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
