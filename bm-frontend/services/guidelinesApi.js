// import { apiRequest } from "./api";

// // GET /guidelines
// export function getGuidelinesList({ category, product_id, crop, topic, seasonal } = {}) {
//   const params = new URLSearchParams();
//   if (category) params.append("category", category);
//   if (product_id) params.append("product_id", product_id);
//   if (crop) params.append("crop", crop);
//   if (topic) params.append("topic", topic);
//   if (seasonal !== undefined) params.append("seasonal", seasonal);
//   const query = params.toString();
//   return apiRequest(`/guidelines${query ? "?" + query : ""}`);
// }

// export function getGuidelinesList() {
//   return apiRequest('/demo/guidelines', 'GET', null, { useAuth: false });
// }

// // GET /guidelines/{guideline_id}
// export function getGuidelineById(guidelineId) {
//   return apiRequest(`/guidelines/${guidelineId}`);
// }

// // GET /news
// export function getNewsList() {
//   return apiRequest("/news");
// }

// // POST /admin/guidelines
// export function createGuideline(guidelineData) {
//   return apiRequest("/admin/guidelines", "POST", guidelineData);
// }

// // PATCH /admin/guidelines/{guideline_id}
// export function updateGuideline(guidelineId, guidelineData) {
//   return apiRequest(`/admin/guidelines/${guidelineId}`, "PATCH", guidelineData);
// }

// // POST /admin/news
// export function createNewsItem(newsData) {
//   return apiRequest("/admin/news", "POST", newsData);
// }
import { apiRequest } from "./api";

// GET /demo/guidelines
export function getGuidelinesList({ category, product_id, crop, topic, seasonal } = {}) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (product_id) params.append("product_id", product_id);
  if (crop) params.append("crop", crop);
  if (topic) params.append("topic", topic);
  if (seasonal !== undefined) params.append("seasonal", seasonal);

  const query = params.toString();

  return apiRequest(`/demo/guidelines${query ? "?" + query : ""}`, "GET", null, {
    useAuth: false,
  });
}

// GET /demo/news
export function getNewsList({ category } = {}) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);

  const query = params.toString();

  return apiRequest(`/demo/news${query ? "?" + query : ""}`, "GET", null, {
    useAuth: false,
  });
}

// GET /guidelines/{guideline_id}
export function getGuidelineById(guidelineId) {
  return apiRequest(`/guidelines/${guidelineId}`);
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