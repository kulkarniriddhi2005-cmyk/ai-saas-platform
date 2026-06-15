import { useRef, useState } from "react";
import * as aiApi from "../api/aiApi.js";
import Loader from "../components/Loader.jsx";

function pickRecorderMime() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return "";
}

export default function VoiceToText() {
  const [transcript, setTranscript] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordMime, setRecordMime] = useState("");
  const chunksRef = useRef([]);
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);

  function stopStreams() {
    mediaRef.current?.getTracks?.().forEach((t) => t.stop());
    mediaRef.current = null;
  }

  async function startRecording() {
    setError("");
    setTranscript("");
    setDemo(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickRecorderMime();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;
      setRecordMime(rec.mimeType || mimeType || "audio/webm");
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stopStreams();
        recorderRef.current = null;
        setRecording(false);
      };
      rec.start(200);
      setRecording(true);
    } catch (err) {
      stopStreams();
      setError(err.message || "Could not access microphone.");
    }
  }

  function cancelRecording() {
    chunksRef.current = [];
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = () => {
        stopStreams();
        recorderRef.current = null;
        setRecording(false);
      };
      rec.stop();
    } else {
      stopStreams();
      setRecording(false);
    }
  }

  async function sendBlob(blob, filename, mimeType) {
    setError("");
    setTranscript("");
    setDemo(false);
    if (!blob?.size) {
      setError("No audio to transcribe.");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      const type = mimeType || blob.type || "audio/webm";
      fd.append("audio", blob, filename);
      const data = await aiApi.transcribeAudio(fd);
      setTranscript(data.text || "");
      setDemo(Boolean(data.demo));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setPending(false);
    }
  }

  async function transcribeRecording() {
    const rec = recorderRef.current;
    const mime = recordMime || rec?.mimeType || "audio/webm";
    if (rec && rec.state === "recording") {
      await new Promise((resolve) => {
        const r = rec;
        const done = () => {
          r.removeEventListener("stop", done);
          resolve();
        };
        r.addEventListener("stop", done);
        r.stop();
      });
    }
    stopStreams();
    setRecording(false);
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];
    await sendBlob(blob, "recording.webm", mime);
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    sendBlob(file, file.name, file.type);
  }

  return (
    <div>
      <h1 className="page-title">Voice to text</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1rem", maxWidth: 640 }}>
        Record from your microphone or upload an audio file. Speech is transcribed with
        Gemini (same API key as other AI tools).
      </p>
      <div className="card">
        <div className="form-group">
          <label>Microphone</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {!recording ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={startRecording}
                disabled={pending}
              >
                Start recording
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={transcribeRecording}
                  disabled={pending}
                >
                  Stop &amp; transcribe
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelRecording}
                  disabled={pending}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          {recording && (
            <p style={{ marginTop: "0.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>
              Recording… speak, then choose “Stop &amp; transcribe”.
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="vtt-file">Or upload audio</label>
          <input
            id="vtt-file"
            type="file"
            accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.flac"
            onChange={onFileChange}
            disabled={pending || recording}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {pending && (
          <div style={{ marginTop: "1rem" }}>
            <Loader label="Transcribing…" />
          </div>
        )}
        {transcript && (
          <>
            {demo && (
              <div className="demo-banner" role="status" style={{ marginTop: "1rem" }}>
                <strong>Demo mode.</strong> Add <code>GEMINI_API_KEY</code> in{" "}
                <code>server/.env</code> for real transcription.
              </div>
            )}
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label htmlFor="vtt-out">Transcript</label>
              <textarea
                id="vtt-out"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
