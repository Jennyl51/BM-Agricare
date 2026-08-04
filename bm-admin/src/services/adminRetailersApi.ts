import { getAdminToken } from "./adminAuthApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminRetailer = {
  user_id: string;
  retailer_id: string;
  name: string;
  phone_number: string;
  region: string;
  tier: string;
  total_points: number;
  assigned_tce_id?: string | null;
  invoice_count: number;
  total_sales: number;
  invoice_points: number;
  last_invoice_at?: string | null;
  redemption_count: number;
  last_redemption_at?: string | null;
  last_business_activity_at?: string | null;
  profile_image_url?: string | null;
};

export type RetailerSummary = {
  totalRetailers: number;
  activeRegions: number;
  totalPoints: number;
  totalSales: number;
  totalInvoices: number;
  totalRedemptions: number;
};

export type RetailersOverview = {
  summary: RetailerSummary;
  retailers: AdminRetailer[];
};

export type RetailerInvoice = {
  invoice_id: string;
  invoice_number?: string | null;
  status: string;
  tce_status?: string | null;
  admin_status?: string | null;
  created_at: string;
  total_sales: number;
  points: number;
};

export type RetailerRedemption = {
  redemption_id: string;
  status: string;
  created_at: string;
  reward_items: string;
  total_points: number;
};

export type RetailerDetailResponse = {
  retailer: AdminRetailer;
  recentInvoices: RetailerInvoice[];
  recentRedemptions: RetailerRedemption[];
};

async function authorizedFetch<T>(path: string): Promise<T> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed.");
  }

  return data;
}

export function getRetailersOverview(): Promise<RetailersOverview> {
  return authorizedFetch<RetailersOverview>("/admin/retailers/overview");
}

export function getRetailerDetail(
  retailerId: string
): Promise<RetailerDetailResponse> {
  return authorizedFetch<RetailerDetailResponse>(
    `/admin/retailers/${retailerId}`
  );
}