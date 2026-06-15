export default function Loader({ label = "Loading…" }) {
  return (
    <div className="loader-wrap" aria-busy="true" aria-live="polite">
      <span className="loader-dot" />
      <span className="loader-label">{label}</span>
      <style>{`
        .loader-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: var(--muted);
          font-size: 0.9rem;
        }
        .loader-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 0.9s ease-in-out infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.35; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
