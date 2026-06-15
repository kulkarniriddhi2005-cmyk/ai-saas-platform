import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        navigate(from, { replace: true });
      } else {
        await register({ email, password, name: name || undefined });
        window.alert("Registration successful. Please log in to continue.");
        setMode("login");
        setPassword("");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || err.message || "Something went wrong";
      const detail = err.response?.data?.detail;
      if (detail) msg = `${msg} (${detail})`;
      if (status === 404) {
        msg =
          "API returned 404 — another app may be using the API port, or QuickAI’s server is not running. Stop `npm run dev`, then run it again from `client/` or the repo root so both Vite and the API start. QuickAI uses port 5001 by default (see server/.env PORT).";
      }
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h1 className="page-title">{mode === "login" ? "Log in" : "Create account"}</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="name">Name (optional)</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p style={{ marginTop: "1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.9rem" }}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.9rem" }}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <Link to="/">← Back home</Link>
        </p>
      </div>
    </div>
  );
}
