import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";
import TierRegionChart from "../components/TierRegionChart";
import {
  summaryCards,
  invoices,
  retailers,
  rewardRequests,
} from "../data/adminMockData";

export default function Dashboard() {
  const topRetailers = [...retailers]
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="page">
        <h1>Admin Dashboard</h1>
        <p style={{ color: "#667085" }}>
          Overview of invoices, retailer performance, sales, and reward activity.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginTop: 24,
          }}
        >
          <StatCard title="Pending Invoices" value={summaryCards.pendingInvoices} subtitle="Need review" />
          <StatCard title="Total Invoices" value={summaryCards.totalInvoices} subtitle="All submissions" />
          <StatCard title="Total Retailers" value={summaryCards.totalRetailers} subtitle="Registered retailers" />
          <StatCard title="Reward Requests" value={summaryCards.rewardRequests} subtitle="Pending or active" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          <SalesChart />
          <TierRegionChart />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          <div className="card">
            <h2>Recent Invoices</h2>
            {invoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #eee",
                  padding: "14px 0",
                }}
              >
                <div>
                  <strong>INV-{invoice.invoice_id}</strong>
                  <p style={{ margin: "4px 0", color: "#667085" }}>
                    {invoice.retailer_name} · {invoice.region} · ${invoice.total_sales}
                  </p>
                </div>
                <span>{invoice.status}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Top Retailers</h2>
            {topRetailers.map((retailer) => (
              <div
                key={retailer.user_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #eee",
                  padding: "14px 0",
                }}
              >
                <div>
                  <strong>{retailer.name}</strong>
                  <p style={{ margin: "4px 0", color: "#667085" }}>
                    {retailer.region} · {retailer.tier} · {retailer.invoice_count} invoices
                  </p>
                </div>
                <strong>${retailer.total_sales.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Reward Requests</h2>
          {rewardRequests.map((request) => (
            <div
              key={request.order_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #eee",
                padding: "14px 0",
              }}
            >
              <span>
                {request.retailer_name} requested <strong>{request.gift_name}</strong>
              </span>
              <span>{request.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}