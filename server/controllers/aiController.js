import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import FormData from "form-data";
import { PDFParse } from "pdf-parse";
import {
  generateArticleText,
  reviewResumeText,
  summarizeText,
  generateBlogTitles,
  writeEmail,
  pollinationsImageUrl,
  transcribeAudioBuffer,
  generateCodeFromPrompt,
  transcribeHandwritingFromImage,
  explainDataInsights,
  generateMemeContent,
} from "../utils/gemini.js";
import { Article } from "../models/articleModel.js";
import { BlogTitle } from "../models/blogTitleModel.js";
import { ResumeReview } from "../models/resumeReviewModel.js";
import { Summary } from "../models/summaryModel.js";
import { EmailDoc } from "../models/emailModel.js";
import { BgJob } from "../models/bgRemoveModel.js";
import { Transcription } from "../models/transcriptionModel.js";
import { CodeGen } from "../models/codeGenModel.js";
import { Handwriting } from "../models/handwritingModel.js";
import { DataInsight } from "../models/dataInsightModel.js";
import { MemeGen } from "../models/memeGenModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

async function extractTextFromPdf(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  // Ensure pdfjs worker is loaded from local node_modules (works in Node).
  try {
    if (!globalThis.__pdfParseWorkerSet) {
      // In Node, pdfjs-dist's fake-worker loader does `import(workerSrc)`.
      // Point it at the importable pdfjs worker module (not a pdf-parse wrapper file).
      const workerUrl = "pdfjs-dist/legacy/build/pdf.worker.mjs";
      PDFParse.setWorker(workerUrl);
      globalThis.__pdfParseWorkerSet = true;
    }
  } catch {
    // If setting the worker fails, parsing may still work (depends on environment).
  }
  const parser = new PDFParse({ data: buf });
  try {
    const data = await parser.getText();
    return data?.text || "";
  } catch (e) {
    throw new Error(e?.message || "Failed to extract text from PDF");
  } finally {
    try {
      await parser.destroy?.();
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function article(req, res) {
  try {
    const { topic, tone } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ message: "Topic is required" });
    }
    const { text, demo } = await generateArticleText({
      topic: topic.trim(),
      tone,
    });

    // save to DB
    if (req.userId) {
      await Article.create({
        userId: req.userId,
        topic: topic.trim(),
        tone,
        text,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Article generation failed",
    });
  }
}

export async function resume(req, res) {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Resume text is required" });
    }
    const { text: out, demo } = await reviewResumeText(text.trim());

    // save to DB
    if (req.userId) {
      await ResumeReview.create({
        userId: req.userId,
        inputText: text.trim(),
        outputText: out,
        demo,
      });
    }

    return res.json({ text: out, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Resume review failed",
    });
  }
}

export async function resumePdf(req, res) {
  try {
    if (!req.file?.path) {
      return res
        .status(400)
        .json({ message: "PDF file is required (field: pdf)" });
    }

    const inputText = (await extractTextFromPdf(req.file.path)).trim();
    if (!inputText) {
      return res.status(400).json({ message: "No text found in the PDF" });
    }

    const { text: out, demo } = await reviewResumeText(inputText);

    // save to DB
    if (req.userId) {
      await ResumeReview.create({
        userId: req.userId,
        inputText,
        outputText: out,
        demo,
      });
    }

    return res.json({ text: out, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Resume review failed",
    });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
}

export async function bgRemove(req, res) {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: "Image file is required (field: image)" });
    }

    const removeKey = process.env.REMOVEBG_API_KEY?.trim();
    if (!removeKey) {
      if (process.env.NODE_ENV === "production") {
        fs.unlink(req.file.path, () => {});
        return res.status(503).json({
          message:
            "Background removal is not configured. Set REMOVEBG_API_KEY in server/.env (see https://www.remove.bg/api).",
        });
      }
      const name = path.basename(req.file.path);

      // save to DB (demo)
      if (req.userId) {
        await BgJob.create({
          userId: req.userId,
          type: "bg-remove",
          originalFile: `/uploads/${name}`,
          resultUrl: `/uploads/${name}`,
          demo: true,
        });
      }

      return res.json({
        resultUrl: `/uploads/${name}`,
        demo: true,
        message:
          "Demo mode: your image is shown unchanged. Add REMOVEBG_API_KEY for real removal via remove.bg.",
      });
    }

    const form = new FormData();
    form.append("image_file", fs.createReadStream(req.file.path));

    const { data } = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      form,
      {
        headers: { ...form.getHeaders(), "X-Api-Key": removeKey },
        responseType: "arraybuffer",
        maxBodyLength: Infinity,
      }
    );

    const outName = `nobg-${Date.now()}.png`;
    const outPath = path.join(uploadsDir, outName);
    fs.writeFileSync(outPath, Buffer.from(data));
    fs.unlink(req.file.path, () => {});

    // save to DB (real)
    if (req.userId) {
      await BgJob.create({
        userId: req.userId,
        type: "bg-remove",
        originalFile: req.file.path,
        resultUrl: `/uploads/${outName}`,
        demo: false,
      });
    }

    return res.json({
      resultUrl: `/uploads/${outName}`,
      demo: false,
      message: "Background removed.",
    });
  } catch (e) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    console.error(e.response?.data || e.message);
    return res.status(502).json({
      message: "Remove.bg request failed. Check API key and image format.",
    });
  }
}

export async function summary(req, res) {
  try {
    const { text, format } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    const { text: out, demo } = await summarizeText({
      text: text.trim(),
      format,
    });

    // save to DB
    if (req.userId) {
      await Summary.create({
        userId: req.userId,
        inputText: text.trim(),
        format,
        outputText: out,
        demo,
      });
    }

    return res.json({ text: out, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Summary failed",
    });
  }
}

export async function summaryPdf(req, res) {
  try {
    if (!req.file?.path) {
      return res
        .status(400)
        .json({ message: "PDF file is required (field: pdf)" });
    }

    const inputText = (await extractTextFromPdf(req.file.path)).trim();
    if (!inputText) {
      return res.status(400).json({ message: "No text found in the PDF" });
    }

    const { format } = req.body;
    const { text: out, demo } = await summarizeText({
      text: inputText,
      format,
    });

    // save to DB
    if (req.userId) {
      await Summary.create({
        userId: req.userId,
        inputText,
        format,
        outputText: out,
        demo,
      });
    }

    return res.json({ text: out, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Summary failed",
    });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
}

export async function titles(req, res) {
  try {
    const { topic, count } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ message: "Topic is required" });
    }
    const { text, demo } = await generateBlogTitles({
      topic: topic.trim(),
      count,
    });

    // save to DB
    if (req.userId) {
      await BlogTitle.create({
        userId: req.userId,
        topic: topic.trim(),
        count,
        text,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Title generation failed",
    });
  }
}

export async function email(req, res) {
  try {
    const { about, tone, recipientContext } = req.body;
    if (!about?.trim()) {
      return res.status(400).json({ message: "Content / purpose is required" });
    }
    const { text, demo } = await writeEmail({
      about: about.trim(),
      tone: tone === "informal" ? "informal" : "formal",
      recipientContext,
    });

    // save to DB
    if (req.userId) {
      await EmailDoc.create({
        userId: req.userId,
        about: about.trim(),
        tone: tone === "informal" ? "informal" : "formal",
        recipientContext,
        text,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Email generation failed",
    });
  }
}

export async function transcribe(req, res) {
  const filePath = req.file?.path;
  try {
    if (!filePath) {
      return res
        .status(400)
        .json({ message: "Audio file is required (field: audio)" });
    }

    const mime = req.file.mimetype || "application/octet-stream";
    const buf = fs.readFileSync(filePath);
    fs.unlink(filePath, () => {});

    const { text, demo } = await transcribeAudioBuffer({
      buffer: buf,
      mimeType: mime,
    });

    if (req.userId) {
      await Transcription.create({
        userId: req.userId,
        transcript: text,
        mimeType: mime,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    if (filePath) fs.unlink(filePath, () => {});
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Transcription failed",
    });
  }
}

export async function codeFromPrompt(req, res) {
  try {
    const { prompt, language } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const { algorithm, code, text, demo } = await generateCodeFromPrompt({
      prompt: prompt.trim(),
      language,
    });

    if (req.userId) {
      await CodeGen.create({
        userId: req.userId,
        prompt: prompt.trim(),
        language: language?.trim() || undefined,
        algorithmText: algorithm,
        codeText: code,
        demo,
      });
    }

    return res.json({ algorithm, code, text, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Code generation failed",
    });
  }
}

export async function handwritingToText(req, res) {
  const filePath = req.file?.path;
  try {
    if (!filePath) {
      return res
        .status(400)
        .json({ message: "Image file is required (field: image)" });
    }
    const originalFileName = path.basename(filePath);
    const mime = req.file.mimetype || "image/jpeg";
    const buf = fs.readFileSync(filePath);
    fs.unlink(filePath, () => {});

    const { text, demo } = await transcribeHandwritingFromImage({
      imageBuffer: buf,
      mimeType: mime,
    });

    if (req.userId) {
      await Handwriting.create({
        userId: req.userId,
        originalFileName,
        mimeType: mime,
        transcript: text,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    if (filePath) fs.unlink(filePath, () => {});
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Handwriting conversion failed",
    });
  }
}

export async function dataInsights(req, res) {
  try {
    const { dataText, focus } = req.body;
    if (!dataText?.trim()) {
      return res.status(400).json({
        message: "Data or chart description is required (field: dataText)",
      });
    }
    const { text, demo } = await explainDataInsights({
      dataText: dataText.trim(),
      focus,
    });

    if (req.userId) {
      await DataInsight.create({
        userId: req.userId,
        dataText: dataText.trim(),
        focus: focus?.trim() || undefined,
        outputText: text,
        demo,
      });
    }

    return res.json({ text, demo });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Data insights failed",
    });
  }
}

export async function memeGenerator(req, res) {
  try {
    const { topic, style } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ message: "Topic or idea is required" });
    }
    const meme = await generateMemeContent({
      topic: topic.trim(),
      style,
    });
    const visual = `meme image, bold simple composition, ${meme.imagePrompt || topic.trim()}`;
    const imageUrl = pollinationsImageUrl(visual);

    if (req.userId) {
      await MemeGen.create({
        userId: req.userId,
        topic: topic.trim(),
        style: style?.trim() || undefined,
        top: meme.top,
        bottom: meme.bottom,
        imagePrompt: meme.imagePrompt,
        imageUrl,
        demo: Boolean(meme.demo),
      });
    }

    return res.json({
      top: meme.top,
      bottom: meme.bottom,
      imagePrompt: meme.imagePrompt,
      imageUrl,
      demo: Boolean(meme.demo),
    });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({
      message: e.message || "Meme generation failed",
    });
  }
}
