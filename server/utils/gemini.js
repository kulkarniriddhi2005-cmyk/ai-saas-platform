import { GoogleGenerativeAI } from "@google/generative-ai";

function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function requireKeyOrThrow() {
  if (hasGeminiKey()) return;
  const err = new Error(
    "GEMINI_API_KEY is not set. Add it to server/.env (https://aistudio.google.com/apikey)."
  );
  err.statusCode = 503;
  throw err;
}

/** Default model — 1.5 Flash was removed from the Generative Language API; use 2.5+ (see https://ai.google.dev/gemini-api/docs/models/gemini ) */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function getModel() {
  requireKeyOrThrow();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  const model =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  return genAI.getGenerativeModel({ model });
}

function stubArticle({ topic, tone }) {
  return `Sample outline for “${topic}” (${tone || "professional"} tone)

• Hook: why this topic matters now
• 2–3 sections with examples or data
• Practical takeaway for the reader

(Add GEMINI_API_KEY to server/.env and restart the API for a full AI draft.)`;
}

function stubResumeReview(resumeText) {
  const preview = resumeText.slice(0, 200).replace(/\s+/g, " ").trim();
  return `Sample feedback (not AI-generated)

• Strengths: structure and keywords to highlight from your text (“${preview}${resumeText.length > 200 ? "…" : ""}”).
• Gaps: add metrics, dates, and impact where possible.
• Next: tailor bullets to each job description.

(Add GEMINI_API_KEY to server/.env and restart for detailed AI review.)`;
}

export async function generateArticleText({ topic, tone }) {
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return { text: stubArticle({ topic, tone }), demo: true };
  }
  const model = getModel();
  const prompt = `Write a short blog article (about 400-600 words) about: "${topic}".
Tone: ${tone || "professional"}.
Use clear headings where helpful. Output plain text only, no markdown code fences.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return { text: text?.trim() || "", demo: false };
}

export async function reviewResumeText(resumeText) {
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return { text: stubResumeReview(resumeText), demo: true };
  }
  const model = getModel();
  const prompt = `You are an experienced hiring manager. Review the following resume text and give:
1) Strengths
2) Issues or gaps
3) Concrete suggestions to improve

Resume:
---
${resumeText}
---

Be concise and actionable. Plain text only.`;
  const result = await model.generateContent(prompt);
  return { text: result.response.text()?.trim() || "", demo: false };
}

function stubSummary(text) {
  const clip = text.slice(0, 120).replace(/\s+/g, " ");
  return `Demo summary: Your text starts with “${clip}…” — key ideas would be listed here with GEMINI_API_KEY.`;
}

export async function summarizeText({ text, format }) {
  if (!text?.trim()) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return { text: stubSummary(text.trim()), demo: true };
  }
  const model = getModel();
  const style =
    format === "bullet"
      ? "Use bullet points."
      : "Use 1–2 short paragraphs.";
  const prompt = `Summarize the following text clearly and faithfully. ${style}
Do not invent facts. Plain text only.

---
${text.trim()}
---`;
  const result = await model.generateContent(prompt);
  return { text: result.response.text()?.trim() || "", demo: false };
}

function stubTitles(topic) {
  return `Demo titles for “${topic}”:\n• ${topic}: What You Need to Know\n• A Fresh Look at ${topic}\n• ${topic} Explained Simply\n(Add GEMINI_API_KEY for AI-generated titles.)`;
}

export async function generateBlogTitles({ topic, count }) {
  const n = Math.min(Math.max(Number(count) || 8, 3), 15);
  if (!topic?.trim()) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return { text: stubTitles(topic.trim()), demo: true };
  }
  const model = getModel();
  const prompt = `Generate exactly ${n} catchy, clear blog post title ideas for this topic: "${topic.trim()}".
One title per line. No numbers or bullets — just the title text each line. Plain text.`;
  const result = await model.generateContent(prompt);
  return { text: result.response.text()?.trim() || "", demo: false };
}

function stubEmail(about, tone) {
  return `Demo ${tone} email about “${about.slice(0, 80)}…”\n\nSubject: Quick note\n\nDear …,\n\n[Body would be generated here with GEMINI_API_KEY.]\n\nBest regards`;
}

export async function writeEmail({ about, tone, recipientContext }) {
  if (!about?.trim()) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return {
      text: stubEmail(about.trim(), tone || "formal"),
      demo: true,
    };
  }
  const model = getModel();
  const t = tone === "informal" ? "informal, warm, concise" : "formal, professional, polite";
  const ctx = recipientContext?.trim()
    ? `Recipient / context: ${recipientContext.trim()}\n`
    : "";
  const prompt = `Write a complete email in a ${t} tone.

${ctx}Purpose / content to cover:
${about.trim()}

Include Subject line on its own first line, then a blank line, then the email body. Plain text only.`;
  const result = await model.generateContent(prompt);
  return { text: result.response.text()?.trim() || "", demo: false };
}

export function pollinationsImageUrl(prompt) {
  const q = prompt.slice(0, 900);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=768&height=768&nologo=true`;
}

function stubTranscribe() {
  return {
    text: 'Demo transcript: "Hello — this is sample speech-to-text. Add GEMINI_API_KEY in server/.env for real AI transcription from your audio."',
    demo: true,
  };
}

/**
 * Transcribe speech from audio bytes (Gemini multimodal).
 */
export async function transcribeAudioBuffer({ buffer, mimeType }) {
  if (!buffer?.length) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return stubTranscribe();
  }
  const model = getModel();
  const mt = mimeType?.trim() || "audio/webm";
  const base64 = buffer.toString("base64");
  const prompt = `Transcribe all spoken words in this audio to plain text.
Rules: output only the transcribed speech, no labels like "Transcript:". If multiple speakers, you may prefix lines with Speaker 1 / Speaker 2 only if clearly distinct. If audio is silent or unintelligible, say so briefly.`;
  const result = await model.generateContent([
    {
      inlineData: { mimeType: mt, data: base64 },
    },
    { text: prompt },
  ]);
  const text = result.response.text()?.trim() || "";
  return { text, demo: false };
}

const ALGO_MARK = "===ALGORITHM===";
const CODE_MARK = "===CODE===";

export function splitAlgorithmAndCode(raw) {
  const full = raw?.trim() || "";
  const a = full.indexOf(ALGO_MARK);
  const c = full.indexOf(CODE_MARK);
  if (a !== -1 && c !== -1 && c > a) {
    return {
      algorithm: full.slice(a + ALGO_MARK.length, c).trim(),
      code: full.slice(c + CODE_MARK.length).trim(),
      text: full,
    };
  }
  const half = Math.max(1, Math.floor(full.length / 2));
  return {
    algorithm: full.slice(0, half).trim() || "(No algorithm section.)",
    code: full.slice(half).trim() || full,
    text: full,
  };
}

function stubCode(prompt, language) {
  const clip = prompt.slice(0, 80).replace(/\s+/g, " ").trim();
  return `${ALGO_MARK}
1. Validate input for "${clip}${prompt.length > 80 ? "…" : ""}".
2. Apply core logic in ${language || "the chosen language"}.
3. Return the result.
${CODE_MARK}
// Demo (not AI-generated)
function placeholder() {
  // Add GEMINI_API_KEY in server/.env for full algorithm + code.
  return null;
}`;
}

export async function generateCodeFromPrompt({ prompt, language }) {
  if (!prompt?.trim()) {
    return { algorithm: "", code: "", text: "", demo: false };
  }
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    const raw = stubCode(prompt.trim(), language);
    return { ...splitAlgorithmAndCode(raw), demo: true };
  }
  const model = getModel();
  const lang = language?.trim() || "Choose the best language or stack for the request.";
  const userPrompt = `You are an expert software developer. The user request:

${prompt.trim()}

Language / stack preference: ${lang}

You MUST structure your answer in exactly two parts with these exact delimiters on their own lines:
${ALGO_MARK}
(first part: algorithm only — steps, pseudocode, complexity notes, data structures — no full implementation)
${CODE_MARK}
(second part: the actual working code with brief comments as needed)

Rules: both sections are required and should each be substantial (roughly similar length). No markdown fences around the whole reply. Plain text.`;
  const result = await model.generateContent(userPrompt);
  const raw = result.response.text()?.trim() || "";
  return { ...splitAlgorithmAndCode(raw), demo: false };
}

function stubHandwriting() {
  return {
    text: "Demo: transcribed text would appear here. Upload a photo of notes and add GEMINI_API_KEY in server/.env for real handwriting recognition.",
    demo: true,
  };
}

export async function transcribeHandwritingFromImage({ imageBuffer, mimeType }) {
  if (!imageBuffer?.length) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return stubHandwriting();
  }
  const model = getModel();
  const mt = mimeType?.trim() || "image/jpeg";
  const base64 = imageBuffer.toString("base64");
  const prompt = `Transcribe all handwritten text in this image into clean digital text.

Rules: preserve meaningful line breaks and bullet structure. Fix obvious spelling only when the intended word is clear. If part is illegible, write [illegible] for that fragment. If there is no handwriting, say so briefly. Output only the transcribed text (no "Here is the transcription" preamble).`;
  const result = await model.generateContent([
    { inlineData: { mimeType: mt, data: base64 } },
    { text: prompt },
  ]);
  const text = result.response.text()?.trim() || "";
  return { text, demo: false };
}

function stubDataInsights(dataText) {
  const clip = dataText.slice(0, 100).replace(/\s+/g, " ").trim();
  return `Demo insights\n\nYour data starts with: "${clip}…"\n\nWith GEMINI_API_KEY, you would get trends, caveats, and chart ideas tailored to this dataset.`;
}

export async function explainDataInsights({ dataText, focus }) {
  if (!dataText?.trim()) return { text: "", demo: false };
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return { text: stubDataInsights(dataText.trim()), demo: true };
  }
  const model = getModel();
  const focusLine = focus?.trim()
    ? `The user wants emphasis on: ${focus.trim()}\n`
    : "";
  const userPrompt = `You are a data analyst helping someone understand data or a chart.

${focusLine}Data / chart description / pasted values:
---
${dataText.trim()}
---

Provide:
1) What the data shows (plain language)
2) Trends, comparisons, or outliers worth noting
3) Caveats (sample size, missing context, etc.)
4) Suggested follow-up analyses or chart types

Use clear numbered sections. Plain text only.`;
  const result = await model.generateContent(userPrompt);
  return { text: result.response.text()?.trim() || "", demo: false };
}

function stubMeme(topic) {
  return {
    top: "DEMO MODE",
    bottom: topic?.slice(0, 40) || "ADD GEMINI KEY",
    imagePrompt: `classic internet meme style humorous image about ${topic || "technology"}`,
    demo: true,
  };
}

export async function generateMemeContent({ topic, style }) {
  const t = topic?.trim() || "something funny";
  if (!hasGeminiKey()) {
    if (process.env.NODE_ENV === "production") requireKeyOrThrow();
    return stubMeme(t);
  }
  const model = getModel();
  const st = style?.trim() || "witty, internet-meme appropriate, not offensive or hateful";
  const userPrompt = `Create one meme idea for this topic: "${t}"

Tone: ${st}

Reply with ONLY a single JSON object (no markdown fences) with exactly these keys:
{"top":"short top line text","bottom":"short bottom line text","imagePrompt":"one English phrase describing a simple iconic meme image to illustrate the joke (no text in image description)"}

Keep top and bottom lines very short (typical meme caption length). JSON must be valid.`;
  const raw = (await model.generateContent(userPrompt)).response.text()?.trim() || "";
  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return {
      top: "MEME",
      bottom: t.slice(0, 60),
      imagePrompt: `funny meme about ${t}`,
      demo: false,
    };
  }
  return {
    top: String(parsed.top || "").trim() || "—",
    bottom: String(parsed.bottom || "").trim() || "—",
    imagePrompt: String(parsed.imagePrompt || `meme about ${t}`).trim(),
    demo: false,
  };
}
