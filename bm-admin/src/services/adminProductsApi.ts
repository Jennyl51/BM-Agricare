import { getAdminToken } from "./adminAuthApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminProduct = {
  product_id: string;
  product_name: string;
  brand: string;
  company?: string | null;
  weight?: string | null;
  formula?: string | null;
  category_group?: string | null;
  category?: string | null;
  sub_cat?: string | null;
  point_factor: number;
  price: number;
  short_desc?: string | null;
  description?: string | null;
  nutrients?: string | null;
  key_features?: string | null;
  application?: string | null;
  image_url?: string | null;
  brand_image_url?: string | null;
  is_active: boolean;
  is_seasonal: boolean;
};

export type AdminProductPayload = {
  product_name?: string;
  brand?: string;
  company?: string;
  weight?: string;
  formula?: string;
  category_group?: string;
  category?: string;
  sub_cat?: string;
  point_factor?: number;
  price?: number;
  short_desc?: string;
  description?: string;
  nutrients?: string;
  key_features?: string;
  application?: string;
  image_url?: string;
  brand_image_url?: string;
  is_active?: boolean;
  is_seasonal?: boolean;
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

export function listAdminProducts({
    includeInactive = true,
  }: {
    includeInactive?: boolean;
  } = {}): Promise<AdminProduct[]> {
    return authorizedFetch<AdminProduct[]>(
      `/admin/products?include_inactive=${includeInactive}`
    );
}

export function createAdminProduct(
  payload: AdminProductPayload
): Promise<AdminProduct> {
  return authorizedFetch<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(
  productId: string,
  payload: AdminProductPayload
): Promise<AdminProduct> {
  return authorizedFetch<AdminProduct>(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setAdminProductActive(
  productId: string,
  isActive: boolean
): Promise<AdminProduct> {
  return authorizedFetch<AdminProduct>(
    `/admin/products/${productId}/active?is_active=${isActive}`,
    {
      method: "PATCH",
    }
  );
}

export type ProductMetrics = {
    product: AdminProduct;
    summary: {
      invoice_count: number;
      total_sales: number;
      units_sold: number;
      points_issued: number;
    };
    monthlyUnits: Array<{
      month: string;
      units_sold: number;
      invoice_count: number;
      points_issued: number;
    }>;
  };
  
  export async function uploadProductImage(file: File): Promise<{
    image_url: string;
    filename: string;
  }> {
    const token = getAdminToken();
  
    if (!token) {
      throw new Error("Missing admin session. Please log in again.");
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch(`${API_BASE_URL}/admin/products/upload-image`, {
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
  
  export function getAdminProductMetrics(
    productId: string
  ): Promise<ProductMetrics> {
    return authorizedFetch<ProductMetrics>(`/admin/products/${productId}/metrics`);
  }
  
  export function deleteAdminProduct(productId: string): Promise<{
    ok: boolean;
    deleted_product_id: string;
  }> {
    return authorizedFetch(`/admin/products/${productId}`, {
      method: "DELETE",
    });
  }