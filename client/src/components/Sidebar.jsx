import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const item = ({ isActive }) => ({
  display: "block",
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  color: isActive ? "var(--text)" : "var(--muted)",
  background: isActive ? "var(--bg)" : "transparent",
  textDecoration: "none",
  fontWeight: isActive ? 600 : 400,
  marginBottom: "0.25rem",
});

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "1rem 0.75rem",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--muted)",
          marginBottom: "0.5rem",
          paddingLeft: "0.5rem",
        }}
      >
        Tools
      </div>
      <NavLink to="/dashboard" style={item}>
        Dashboard
      </NavLink>
      <NavLink to="/write" style={item}>
        Write article
      </NavLink>
      <NavLink to="/resume" style={item}>
        Resume review
      </NavLink>
      <NavLink to="/bg-remove" style={item}>
        Background remover
      </NavLink>
      <NavLink to="/summary" style={item}>
        Text summary
      </NavLink>
      <NavLink to="/titles" style={item}>
        Blog titles
      </NavLink>
      <NavLink to="/email" style={item}>
        Email writer
      </NavLink>
      <NavLink to="/voice-to-text" style={item}>
        Voice to text
      </NavLink>
      <NavLink to="/text-to-voice" style={item}>
        Text to voice
      </NavLink>
      <NavLink to="/code-generator" style={item}>
        Code generator
      </NavLink>
      <NavLink to="/handwriting-to-text" style={item}>
        Handwriting → text
      </NavLink>
      <NavLink to="/data-insights" style={item}>
        Data insights
      </NavLink>
      <NavLink to="/meme-generator" style={item}>
        Meme generator
      </NavLink>
    </aside>
  );
}
