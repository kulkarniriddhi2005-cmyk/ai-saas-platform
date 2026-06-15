import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function AccountSettings() {
  const { user, updateAccount } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    try {
      await updateAccount({
        email,
        currentPassword,
        newPassword: newPassword || undefined,
      });
      setSuccess("Account updated successfully. Use your new credentials next time you log in.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update account";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 className="page-title">Manage account</h1>
      <div className="card">
        <form onSubmit={onSubmit}>
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
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New password (optional)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Updating..." : "Update account"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {success && <p style={{ color: "#34d399", marginTop: "0.75rem" }}>{success}</p>}
      </div>
    </div>
  );
}
