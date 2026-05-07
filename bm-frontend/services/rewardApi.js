import { apiRequest } from './api';

export function getRewardsList() {
  return apiRequest('/rewards');
}

export function getPointsSummary() {
  return apiRequest('/points/summary');
}

export function getPointsHistory() {
  return apiRequest('/points/history');
}

export function redeemReward(rewardId, quantity = 1, retailerLocation = null) {
  return apiRequest('/redemptions', 'POST', {
    items: [{ reward_id: rewardId, quantity }],
    retailer_location: retailerLocation,
  });
}

export function getMyRedemptions() {
  return apiRequest('/redemptions/me');
}

export function getTceRedemptions(pendingOnly = true) {
  return apiRequest(`/tce/redemptions?pending_only=${pendingOnly}`);
}

export function getTceRedemptionDetail(redemptionId) {
  return apiRequest(`/tce/redemptions/${redemptionId}`);
}

export function updateTceRedemption(redemptionId, updates) {
  return apiRequest(`/tce/redemptions/${redemptionId}`, 'PATCH', updates);
}
