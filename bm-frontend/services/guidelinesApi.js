import { apiRequest } from "./api";

// GET /guidelines
export function getGuidelinesList({ category, product_id, crop, topic, seasonal } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (product_id) params.append("product_id", product_id);
  if (crop) params.append("crop", crop);
  if (topic) params.append("topic", topic);
  if (seasonal !== undefined) params.append("seasonal", seasonal);
  const query = params.toString();
  return apiRequest(`/guidelines${query ? "?" + query : ""}`);
}

// GET /guidelines/{guideline_id}
export function getGuidelineById(guidelineId) {
  return apiRequest(`/guidelines/${guidelineId}`);
}

// GET /news
export function getNewsList() {
  return apiRequest("/news");
}

// POST /admin/guidelines
export function createGuideline(guidelineData) {
  return apiRequest("/admin/guidelines", "POST", guidelineData);
}

// PATCH /admin/guidelines/{guideline_id}
export function updateGuideline(guidelineId, guidelineData) {
  return apiRequest(`/admin/guidelines/${guidelineId}`, "PATCH", guidelineData);
}

// POST /admin/news
export function createNewsItem(newsData) {
  return apiRequest("/admin/news", "POST", newsData);
}
