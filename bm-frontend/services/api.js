const BASE_URL = "http://10.43.149.124:8000";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail?.message || "Request failed");
  }

  return data;
}