import { apiRequest } from "./api";

// POST /auth/login
export function login(username, password) {
  return apiRequest("/auth/login", "POST", { username, password });
}

// POST /auth/signup
export function signup(payload) {
  return apiRequest("/auth/signup", "POST", payload);
}
