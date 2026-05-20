import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { invoices } from "../data/adminMockData";

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const invoice = invoices.find((i) => String(i.invoice_id) === invoiceId);

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="page">
          <h1>Invoice not found</h1>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page">
        <h1>Invoice INV-{invoice.invoice_id}</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Detailed invoice review for admin approval.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div className="card">
            <h2>Invoice Information</h2>
            <p><strong>Retailer:</strong> {invoice.retailer_name}</p>
            <p><strong>Retailer ID:</strong> {invoice.retailer_id}</p>
            <p><strong>Region:</strong> {invoice.region}</p>
            <p><strong>Tier:</strong> {invoice.tier}</p>
            <p><strong>Status:</strong> {invoice.status}</p>
            <p><strong>Submitted:</strong> {invoice.created_at}</p>
            <p><strong>Total Sales:</strong> ${invoice.total_sales}</p>
            <p><strong>Points:</strong> {invoice.points}</p>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="green-btn">Approve</button>
              <button className="danger-btn">Reject</button>
            </div>
          </div>

          <div className="card">
            <h2>Invoice Image / PDF</h2>
            <div
              style={{
                height: 360,
                borderRadius: 16,
                background: "#eef4eb",
                display: "grid",
                placeItems: "center",
                color: "var(--text-muted)",
              }}
            >
              Invoice preview placeholder
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Invoice Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price at Purchase</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.product_name} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "14px 0" }}>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price_at_purchase}</td>
                  <td>${item.quantity * item.price_at_purchase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}