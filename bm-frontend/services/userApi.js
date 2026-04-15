import { apiRequest } from "./api";

// GET /users/me
export function getUserMe() {
  return apiRequest("/users/me");
}

// PATCH /users/me
export function updateUserMe(updates) {
  return apiRequest("/users/me", "PATCH", updates);
}

// GET /admin/users
export function getAdminUsers() {
  return apiRequest("/admin/users");
}

// POST /admin/users
export function createAdminUser(user) {
  return apiRequest("/admin/users", "POST", user);
}

// PATCH /admin/users/{user_id}
export function updateAdminUser(userId, updates) {
  return apiRequest(`/admin/users/${userId}`, "PATCH", updates);
}
