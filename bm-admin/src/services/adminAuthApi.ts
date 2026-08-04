const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminUser = {
  email: string;
  display_name?: string | null;
  role: string;
};

export type StartLoginResponse = {
  requires_code: boolean;
  message: string;
  email: string;
};

export type VerifyCodeResponse = {
  access_token: string;
  token_type: string;
  admin: AdminUser;
};

export async function startAdminLogin(
  email: string,
  password: string
): Promise<StartLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/start-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to start login.");
  }

  return data;
}

export async function verifyAdminCode(
  email: string,
  code: string
): Promise<VerifyCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/verify-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to verify login code.");
  }

  return data;
}

export async function getCurrentAdmin(token: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to verify admin session.");
  }

  return data;
}

export function saveAdminSession(authResponse: VerifyCodeResponse) {
  localStorage.setItem("bmAdminToken", authResponse.access_token);
  localStorage.setItem("bmAdminUser", JSON.stringify(authResponse.admin));
}

export function getAdminToken() {
  return localStorage.getItem("bmAdminToken");
}

export function getSavedAdminUser(): AdminUser | null {
  const rawUser = localStorage.getItem("bmAdminUser");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem("bmAdminToken");
  localStorage.removeItem("bmAdminUser");
}