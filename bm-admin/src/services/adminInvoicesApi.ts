import { getAdminToken } from "./adminAuthApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminInvoiceItem = {
  item_id: string;
  product_id: string;
  product_name: string;
  point_factor: number;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  points: number;
};

export type AdminInvoiceDetail = {
  invoice_id: string;
  invoice_number?: string | null;
  retailer_id: string;
  retailer_name: string;
  retailer_phone?: string | null;
  region: string;
  tier: string;
  photo_url?: string | null;
  status: string;
  tce_status?: string | null;
  tce_reviewed_by?: string | null;
  tce_reviewed_at?: string | null;
  tce_rejection_reason?: string | null;
  admin_status?: string | null;
  admin_reviewed_by?: string | null;
  admin_reviewed_at?: string | null;
  admin_rejection_reason?: string | null;
  assigned_tce_id?: string | null;
  approved_by?: string | null;
  created_at: string;
  total_amount: number;
  total_points: number;
  items: AdminInvoiceItem[];
};

export async function getAdminInvoiceDetail(
  invoiceId: string
): Promise<AdminInvoiceDetail> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/admin/invoices/${invoiceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to load invoice.");
  }

  return data;
}

export async function reviewAdminInvoice({
  invoiceId,
  reviewStatus,
  rejectionReason,
}: {
  invoiceId: string;
  reviewStatus: "approved" | "rejected";
  rejectionReason?: string;
}): Promise<AdminInvoiceDetail> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing admin session. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/invoices/${invoiceId}/review`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        review_status: reviewStatus,
        rejection_reason: rejectionReason || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to review invoice.");
  }

  return data;
}


export type AdminInvoiceListItem = {
    invoice_id: string;
    invoice_number?: string | null;
    retailer_id: string;
    retailer_name: string;
    region: string;
    tier: string;
    status: string;
    tce_status?: string | null;
    admin_status?: string | null;
    created_at: string;
    photo_url?: string | null;
    total_sales: number;
    points: number;
    item_count: number;
  };
  
  export async function listAdminInvoices({
    status = "all",
    limit = 100,
  }: {
    status?: string;
    limit?: number;
  } = {}): Promise<AdminInvoiceListItem[]> {
    const token = getAdminToken();
  
    if (!token) {
      throw new Error("Missing admin session. Please log in again.");
    }
  
    const params = new URLSearchParams({
      status,
      limit: String(limit),
    });
  
    const response = await fetch(`${API_BASE_URL}/admin/invoices?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.detail || "Unable to load invoices.");
    }
  
    return data;
  }