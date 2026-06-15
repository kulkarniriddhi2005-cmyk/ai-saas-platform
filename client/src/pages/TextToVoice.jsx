import { useEffect, useRef, useState } from "react";

export default function TextToVoice() {
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    const load = () => {
      const list = window.speechSynthesis.getVoices() || [];
      setVoices(list);
      setVoiceUri((prev) => {
        if (prev) return prev;
        const en =
          list.find((v) => /en(-|$)/i.test(v.lang)) ||
          list.find((v) => v.default) ||
          list[0];
        return en ? `${en.name}::${en.lang}` : "";
      });
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utterRef.current = null;
    setSpeaking(false);
  }

  function play() {
    if (!supported || typeof window === "undefined" || !window.speechSynthesis) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(trimmed);
    u.rate = Math.min(2, Math.max(0.5, rate));
    u.pitch = Math.min(2, Math.max(0, pitch));
    if (voiceUri) {
      const [name, lang] = voiceUri.split("::");
      const v = voices.find((x) => x.name === name && x.lang === lang);
      if (v) u.voice = v;
    }
    u.onend = () => {
      utterRef.current = null;
      setSpeaking(false);
    };
    u.onerror = () => {
      utterRef.current = null;
      setSpeaking(false);
    };
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function pauseResume() {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  return (
    <div>
      <h1 className="page-title">Text to voice</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1rem", maxWidth: 640 }}>
        Read text aloud using your browser’s built-in voices (no server upload). Works
        offline once the page is loaded; voice quality depends on your system.
      </p>
      {!supported && (
        <p className="error-text">
          Speech synthesis is not available in this browser.
        </p>
      )}
      {supported && (
        <div className="card">
          <div className="form-group">
            <label htmlFor="ttv-text">Text</label>
            <textarea
              id="ttv-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to hear it spoken…"
              rows={10}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ttv-voice">Voice</label>
            <select
              id="ttv-voice"
              value={voiceUri}
              onChange={(e) => setVoiceUri(e.target.value)}
              disabled={voices.length === 0}
            >
              {voices.length === 0 ? (
                <option value="">Loading voices…</option>
              ) : (
                voices.map((v) => (
                  <option key={`${v.name}-${v.lang}`} value={`${v.name}::${v.lang}`}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label htmlFor="ttv-rate">Speed: {rate.toFixed(1)}×</label>
              <input
                id="ttv-rate"
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ttv-pitch">Pitch: {pitch.toFixed(1)}</label>
              <input
                id="ttv-pitch"
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={play}
              disabled={!text.trim()}
            >
              {speaking ? "Queue again" : "Speak"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={pauseResume}>
              Pause / resume
            </button>
            <button type="button" className="btn btn-ghost" onClick={stop}>
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
