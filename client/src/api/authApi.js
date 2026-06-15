import axios from "axios";
import { API_BASE } from "../utils/constants.js";

const client = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export async function register(payload) {
  const { data } = await client.post("/auth/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await client.post("/auth/login", payload);
  return data;
}

export async function fetchMe() {
  const { data } = await client.get("/auth/me");
  return data;
}

export async function updateMe(payload) {
  const { data } = await client.patch("/auth/me", payload);
  return data;
}
