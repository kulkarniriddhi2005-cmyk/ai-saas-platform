import axios from "axios";
import { API_BASE } from "../utils/constants.js";

const client = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
});

export function setAiAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export async function generateArticle(body) {
  const { data } = await client.post("/ai/article", body);
  return data;
}

export async function reviewResume(body) {
  const { data } = await client.post("/ai/resume", body);
  return data;
}

export async function reviewResumePdf(formData) {
  const { data } = await client.post("/ai/resume/pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function removeBackground(formData) {
  const { data } = await client.post("/ai/bg-remove", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function summarizeText(body) {
  const { data } = await client.post("/ai/summary", body);
  return data;
}

export async function summarizePdf(formData) {
  const { data } = await client.post("/ai/summary/pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function generateTitles(body) {
  const { data } = await client.post("/ai/titles", body);
  return data;
}

export async function writeEmail(body) {
  const { data } = await client.post("/ai/email", body);
  return data;
}

export async function transcribeAudio(formData) {
  const { data } = await client.post("/ai/transcribe", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function generateCode(body) {
  const { data } = await client.post("/ai/code", body);
  return data;
}

export async function handwritingToText(formData) {
  const { data } = await client.post("/ai/handwriting", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function dataInsights(body) {
  const { data } = await client.post("/ai/data-insights", body);
  return data;
}

export async function generateMeme(body) {
  const { data } = await client.post("/ai/meme", body);
  return data;
}
