import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--text)" : "var(--muted)",
  textDecoration: "none",
  fontWeight: isActive ? 600 : 400,
});

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 700,
          fontSize: "1.15rem",
          color: "var(--text)",
          textDecoration: "none",
        }}
      >
        QuickAI
      </Link>
      <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
        <NavLink to="/" end style={linkStyle}>
          Home
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>
        )}
        {isAuthenticated ? (
          <>
            <span className="account-email">{user?.email}</span>
            <Link to="/account" className="btn btn-ghost account-link">
              Manage account
            </Link>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login" style={linkStyle}>
            Log in
          </NavLink>
        )}
      </nav>
    </header>
  );
}
