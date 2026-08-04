import { getAdminToken } from "./adminAuthApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type SummaryCards = {
  pendingInvoices: number;
  totalInvoices: number;
  totalRetailers: number;
  rewardRequests: number;
  totalSales: number;
  pointsIssued: number;
};

export type AdminInvoice = {
  invoice_id: number;
  retailer_id: number;
  retailer_name: string;
  region: string;
  tier: string;
  status: string;
  created_at: string;
  total_sales: number;
  points: number;
};

export type AdminRetailer = {
  user_id: number;
  name: string;
  phone_number?: string | null;
  tier: string;
  total_points: number;
  assigned_tce_id?: number | null;
  region: string;
  total_sales: number;
  invoice_count: number;
};

export type RewardRequest = {
  order_id: number;
  retailer_name: string;
  gift_name: string;
  status: string;
};

export type SalesPoint = {
  date: string;
  [brand: string]: string | number;
};

export type TierRegionPoint = {
    region: string;
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
  };

export type DashboardOverview = {
  summaryCards: SummaryCards;
  recentInvoices: AdminInvoice[];
  topRetailers: AdminRetailer[];
  rewardRequests: RewardRequest[];
  salesOverTime: {
    week: SalesPoint[];
    month: SalesPoint[];
    year: SalesPoint[];
  };
  tierCompositionByRegion: TierRegionPoint[];
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to load dashboard data.");
  }

  return data;
}