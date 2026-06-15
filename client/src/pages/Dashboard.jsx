import { Link } from "react-router-dom";

const tiles = [
  { to: "/write", title: "Write article", desc: "Generate drafts from a topic." },
  { to: "/resume", title: "Resume review", desc: "Get structured feedback." },
  { to: "/bg-remove", title: "BG remover", desc: "Remove image backgrounds (remove.bg)." },
  { to: "/summary", title: "Text summary", desc: "Summarize long text." },
  { to: "/titles", title: "Blog titles", desc: "Title ideas for any topic." },
  { to: "/email", title: "Email writer", desc: "Formal or informal emails." },
  { to: "/voice-to-text", title: "Voice to text", desc: "Transcribe audio with Gemini." },
  { to: "/text-to-voice", title: "Text to voice", desc: "Read text aloud in the browser." },
  { to: "/code-generator", title: "Code generator", desc: "Turn a prompt into code." },
  { to: "/handwriting-to-text", title: "Handwriting → text", desc: "Photo of notes to text." },
  { to: "/data-insights", title: "Data insights", desc: "Explain charts and numbers." },
  { to: "/meme-generator", title: "Meme generator", desc: "Captions + preview image." },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>
        Pick a tool below.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="card"
            style={{
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.15s",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
              {t.title}
            </h2>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.875rem" }}>
              {t.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
