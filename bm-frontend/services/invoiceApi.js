import { apiRequest } from './api';

export function getInvoices() {
  return apiRequest('/invoices');
}

export function getInvoiceDraft() {
  return apiRequest('/invoice-draft');
}

export function setInvoiceDraft(items = []) {
  return apiRequest('/invoice-draft', 'POST', { items });
}

export function clearInvoiceDraft() {
  return apiRequest('/invoice-draft', 'DELETE');
}

export async function addDraftItem(item) {
  const current = await getInvoiceDraft().catch(() => []);
  const next = Array.isArray(current) ? [...current, item] : [item];
  await setInvoiceDraft(next);
  return next;
}

export function submitInvoice({ items, invoice_photo_url = 'local-demo.pdf', gps_lat = 10.8231, gps_lon = 106.6297 }) {
  return apiRequest('/invoices', 'POST', {
    items: items.map((item) => ({ product_id: item.product_id, quantity: Number(item.quantity || 0), price: Number(item.price || 0) })),
    invoice_photo_url,
    gps_lat,
    gps_lon,
    invoice_timestamp: new Date().toISOString(),
  });
}
