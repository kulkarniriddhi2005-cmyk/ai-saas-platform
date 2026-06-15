import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Always load `server/.env` (default dotenv uses process.cwd(), which breaks under some npm/concurrently setups). */
dotenv.config({ path: path.join(__dirname, ".env") });

const uploadsStatic = path.join(__dirname, "uploads");

const app = express();
/** Default 5001 — port 5000 is often taken on Windows by other Node/system services. */
const PORT = Number(process.env.PORT) || 5001;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowAllLocalDev =
  process.env.NODE_ENV !== "production" && process.env.CORS_STRICT !== "1";

app.use(
  cors({
    origin: allowAllLocalDev
      ? true
      : clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsStatic));

const rootApiInfo = {
  service: "QuickAI API",
  note: "JSON API — use Vite for the web UI.",
  health: "/api/health",
  auth: "POST /api/auth/register, POST /api/auth/login",
  ai: "POST /api/ai/* (requires Authorization: Bearer …)",
};

app.get("/", (req, res) => {
  if (req.query.format === "json") {
    return res.json(rootApiInfo);
  }
  const accept = (req.get("accept") || "").toLowerCase();
  if (accept.includes("text/html")) {
    const ui = clientUrl.replace(/"/g, "&quot;");
    return res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QuickAI — API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1rem;
      background: #0f1419; color: #e7edf4; line-height: 1.5; }
    a { color: #60a5fa; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1rem; background: #2563eb;
      color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn:hover { background: #1d4ed8; }
    code { background: #1a2332; padding: 0.15rem 0.4rem; border-radius: 4px; }
    p.muted { color: #8b9cb3; font-size: 0.95rem; }
  </style>
</head>
<body>
  <h1>QuickAI API</h1>
  <p>You opened the <strong>backend</strong> (port ${PORT}). The <strong>web app</strong> runs separately in Vite.</p>
  <p><a class="btn" href="${ui}">Open QuickAI app</a></p>
  <p class="muted">Configured UI URL: <code>${ui}</code> — if the button fails, try <a href="http://localhost:5174">http://localhost:5174</a> when Vite says that port is in use.</p>
  <p class="muted">API check: <a href="/api/health">/api/health</a> · Machine-readable root: <a href="/?format=json">/?format=json</a></p>
</body>
</html>`);
  }
  return res.json(rootApiInfo);
});

app.get("/api/health", (_req, res) => {
  const db =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ ok: true, service: "quickai-server", db });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/subscribers", subscriberRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
    hint:
      "Use the React UI from Vite (port 5173/5174). Example API checks: GET /api/health. Auth and AI routes use POST, not browser navigation.",
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const envPath = path.join(__dirname, ".env");
const mongoUri = process.env.MONGODB_URI?.trim();
if (!mongoUri) {
  console.error(
    `Missing MONGODB_URI. Copy server/.env.example to server/.env and set MONGODB_URI (loaded from: ${envPath}).`
  );
  process.exit(1);
}
if (!process.env.JWT_SECRET?.trim()) {
  console.error(
    `Missing JWT_SECRET. Set it in server/.env (see ${envPath}).`
  );
  process.exit(1);
}

try {
  await connectDb(mongoUri);
} catch (err) {
  const msg = err?.message || String(err);
  console.error("\n[QuickAI] MongoDB connection failed — HTTP server will still start.");
  console.error("  Auth and other DB routes will return errors until MongoDB is reachable.\n");
  console.error("  ", msg);
  console.error(
    "\n  Common fixes: add your IP in Atlas → Network Access; verify MONGODB_URI in server/.env;"
  );
  console.error(
    "  or use local Mongo: mongodb://127.0.0.1:27017/quickai"
  );
  console.error(
    "  TLS errors on Windows + Node 22: try Node 20 LTS or update mongoose/driver.\n"
  );
}

app.listen(PORT, () => {
  console.log(
    `QuickAI API http://localhost:${PORT} (open the app in Vite, not here)`
  );
});
