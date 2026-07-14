import axios from "axios";

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

let _refreshFn = null;
export function setRefreshFn(fn) {
  _refreshFn = fn;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && _refreshFn) {
      original._retry = true;
      try {
        const result = await _refreshFn();
        if (result.ok) {
          return api(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

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
