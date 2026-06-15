import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  article,
  bgRemove,
  resume,
  summary,
  resumePdf,
  summaryPdf,
  titles,
  email,
  transcribe,
  codeFromPrompt,
  handwritingToText,
  dataInsights,
  memeGenerator,
} from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.-]/g, "_") || "upload";
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

function isAudioMime(m) {
  if (!m) return false;
  if (m.startsWith("audio/")) return true;
  if (m === "video/webm" || m === "video/mp4") return true;
  return false;
}

const audioUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isAudioMime(file.mimetype)) {
      cb(new Error("Only audio uploads are allowed (e.g. webm, mp3, wav, m4a)"));
      return;
    }
    cb(null, true);
  },
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdfByMime = file.mimetype === "application/pdf";
    const isPdfByName = file.originalname?.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByName) {
      cb(new Error("Only PDF uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(authMiddleware);

router.post("/article", article);
router.post("/resume", resume);
router.post("/summary", summary);
router.post(
  "/resume/pdf",
  (req, res, next) => {
    pdfUpload.single("pdf")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: err.message || "PDF upload failed" });
      }
      next();
    });
  },
  resumePdf
);
router.post(
  "/summary/pdf",
  (req, res, next) => {
    pdfUpload.single("pdf")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: err.message || "PDF upload failed" });
      }
      next();
    });
  },
  summaryPdf
);
router.post("/titles", titles);
router.post("/email", email);
router.post("/bg-remove", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, bgRemove);
router.post("/transcribe", (req, res, next) => {
  audioUpload.single("audio")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, transcribe);

router.post("/code", codeFromPrompt);
router.post("/data-insights", dataInsights);
router.post("/meme", memeGenerator);
router.post("/handwriting", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, handwritingToText);

export default router;
