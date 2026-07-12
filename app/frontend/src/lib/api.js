import axios from "axios";

// With the dev proxy, /api/* is forwarded to the backend on the same origin.
// In production, set REACT_APP_BACKEND_URL to your actual backend domain.
const BASE =
  process.env.REACT_APP_BACKEND_URL &&
  process.env.REACT_APP_BACKEND_URL !== "http://localhost:3000"
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : "/api";

export const API = BASE;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
