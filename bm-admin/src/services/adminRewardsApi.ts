import { getAdminToken } from "./adminAuthApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminReward = {
  reward_id: string;
  rwd_id?: number | null;
  name: string;
  related_product?: string | null;
  description: string;
  points_required: number;
  min_tier: string;
  stock_quantity: number;
  image_url?: string | null;
  is_pinned: boolean;
  is_seasonal: boolean;
  is_visible: boolean;
  status: string;
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  pinned_at?: string | null;
  unpinned_at?: string | null;
};

export type RewardSummary = {
  total_rewards: number;
  visible_rewards: number;
  hidden_rewards: number;
  pinned_rewards: number;
  seasonal_rewards: number;
};

export type RewardsOverview = {
  summary: RewardSummary;
  rewards: AdminReward[];
};

export type RewardRedemptionLog = {
  redemption_id: string;
  retailer_user_id: string;
  status: string;
  created_at: string;
  quantity: number;
  points_per_unit: number;
  points_deducted: number;
};

export type RewardActivityLog = {
  log_id: string;
  action: string;
  comment?: string | null;
  admin_email?: string | null;
  created_at?: string | null;
};

export type RewardPinSchedule = {
  schedule_id: string;
  action: "pin" | "unpin";
  scheduled_at: string;
  status: string;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type RewardStats = {
  redemption_count: number;
  quantity_redeemed: number;
  points_deducted: number;
  unique_retailers: number;
};

export type RewardDetailResponse = {
  reward: AdminReward;
  stats: RewardStats;
  recentRedemptions: RewardRedemptionLog[];
  activityLog: RewardActivityLog[];
  pinSchedules: RewardPinSchedule[];
};

export type AdminRewardPayload = {
  name?: string;
  related_product?: string;
  description?: string;
  points_required?: number;
  min_tier?: string;
  stock_quantity?: number;
  image_url?: string;
  is_pinned?: boolean;
  is_seasonal?: boolean;
  is_visible?: boolean;
  status?: string;
  admin_notes?: string;
  comment?: string;
};

async function authorizedFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed.");
  }

  return data;
}

export function listAdminRewards({
  includeHidden = true,
}: {
  includeHidden?: boolean;
} = {}): Promise<RewardsOverview> {
  return authorizedFetch<RewardsOverview>(
    `/admin/rewards?include_hidden=${includeHidden}`
  );
}

export function getAdminRewardDetail(
  rewardId: string
): Promise<RewardDetailResponse> {
  return authorizedFetch<RewardDetailResponse>(`/admin/rewards/${rewardId}`);
}

export function createAdminReward(
  payload: AdminRewardPayload
): Promise<AdminReward> {
  return authorizedFetch<AdminReward>("/admin/rewards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminReward(
  rewardId: string,
  payload: AdminRewardPayload
): Promise<AdminReward> {
  return authorizedFetch<AdminReward>(`/admin/rewards/${rewardId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setAdminRewardVisible(
  rewardId: string,
  isVisible: boolean
): Promise<AdminReward> {
  return authorizedFetch<AdminReward>(
    `/admin/rewards/${rewardId}/visible?is_visible=${isVisible}`,
    {
      method: "PATCH",
    }
  );
}

export function setAdminRewardPinned(
  rewardId: string,
  isPinned: boolean
): Promise<AdminReward> {
  return authorizedFetch<AdminReward>(
    `/admin/rewards/${rewardId}/pinned?is_pinned=${isPinned}`,
    {
      method: "PATCH",
    }
  );
}

export function deleteAdminReward(rewardId: string): Promise<{
  ok: boolean;
  deleted_reward_id: string;
}> {
  return authorizedFetch(`/admin/rewards/${rewardId}`, {
    method: "DELETE",
  });
}

export function addRewardActivityNote(
  rewardId: string,
  comment: string
): Promise<RewardDetailResponse> {
  return authorizedFetch<RewardDetailResponse>(
    `/admin/rewards/${rewardId}/activity-note`,
    {
      method: "POST",
      body: JSON.stringify({ comment }),
    }
  );
}

export function createRewardPinSchedule(
  rewardId: string,
  payload: {
    action: "pin" | "unpin";
    scheduled_at: string;
    notes?: string;
  }
): Promise<RewardDetailResponse> {
  return authorizedFetch<RewardDetailResponse>(
    `/admin/rewards/${rewardId}/pin-schedule`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function uploadRewardImage(file: File): Promise<{
  image_url: string;
  filename: string;
}> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/admin/rewards/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to upload image.");
  }

  return data;
}