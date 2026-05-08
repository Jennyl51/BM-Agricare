import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import { invoices, retailers, rewards } from "../data/mockData";

export default function Dashboard() {
  const pending = invoices.filter((i) => i.status === "Pending").length;
  const approved = invoices.filter((i) => i.status === "Approved").length;

  return (
    <AdminLayout>
      <div className="page">
        <h1>Admin Dashboard</h1>
        <p style={{ color: "#667085" }}>Overview of invoice approvals, retailers, and rewards.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 24 }}>
          <StatCard title="Pending Invoices" value={pending} subtitle="Need admin review" />
          <StatCard title="Approved Invoices" value={approved} subtitle="Completed approvals" />
          <StatCard title="Retailers" value={retailers.length} subtitle="Registered retailers" />
          <StatCard title="Rewards" value={rewards.length} subtitle="Available reward items" />
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Recent Invoice Submissions</h2>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{invoice.id}</strong>
                <p style={{ margin: "4px 0", color: "#667085" }}>
                  {invoice.retailer} · {invoice.product} · Qty {invoice.quantity}
                </p>
              </div>
              <span>{invoice.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}