import { apiRequest } from "./api";

// POST /auth/login
export function login(username, password) {
  return apiRequest("/auth/login", "POST", { username, password });
}

// POST /auth/signup
export function signup({ username, password, name, email, phone_number, user_type }) {
  return apiRequest("/auth/signup", "POST", {
    username,
    password,
    name,
    email,
    phone_number,
    user_type,
  });
}
