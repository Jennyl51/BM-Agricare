import { apiRequest } from "./api";

// GET /rewards
export function getRewardsList() {
  return apiRequest("/rewards");
}

// GET /points/history
export function getPointsHistory() {
  return apiRequest("/points/history");
}

// POST /redemptions
export function redeemReward(rewardId, quantity = 1, retailerLocation = null) {
  return apiRequest("/redemptions", "POST", {
    items: [{ reward_id: rewardId, quantity }],
    retailer_location: retailerLocation,
  });
}

// GET /redemptions/me
export function getMyRedemptions() {
  return apiRequest("/redemptions/me");
}

// GET /tce/redemptions?pending_only=true
export function getTceRedemptions(pendingOnly = true) {
  return apiRequest(`/tce/redemptions?pending_only=${pendingOnly}`);
}

// GET /tce/redemptions/{redemption_id}
export function getTceRedemptionDetail(redemptionId) {
  return apiRequest(`/tce/redemptions/${redemptionId}`);
}

// PATCH /tce/redemptions/{redemption_id}
export function updateTceRedemption(redemptionId, updates) {
  return apiRequest(`/tce/redemptions/${redemptionId}`, "PATCH", updates);
}