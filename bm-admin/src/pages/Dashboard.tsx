import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";
import TierRegionChart from "../components/TierRegionChart";
import { Link } from "react-router-dom";
import { downloadCsv, printPage } from "../utils/exportUtils";
import { useAppPreferences } from "../context/AppPreferencesContext";
import type { DashboardOverview } from "../services/adminDashboardApi";
import { getDashboardOverview } from "../services/adminDashboardApi";

function getInvoiceStatusClass(status?: string | null) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved") return "status-approved";
  if (normalized === "rejected") return "status-rejected";
  return "status-pending";
}

function formatStatus(status?: string | null) {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


export default function Dashboard() {
  const { t } = useAppPreferences();

  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summaryCards = dashboardData?.summaryCards;
  const recentInvoices = dashboardData?.recentInvoices || [];
  const topRetailers = dashboardData?.topRetailers || [];
  const rewardRequests = dashboardData?.rewardRequests || [];

  const formattedTotalSales = useMemo(() => {
    const totalSales = summaryCards?.totalSales || 0;

    return totalSales.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }, [summaryCards]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboardOverview();
        setDashboardData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleExportDashboardCsv = () => {
    if (!summaryCards) return;

    const summaryRows = [
      {
        Section: "Summary",
        Metric: "Pending Invoices",
        Value: summaryCards.pendingInvoices,
      },
      {
        Section: "Summary",
        Metric: "Total Invoices",
        Value: summaryCards.totalInvoices,
      },
      {
        Section: "Summary",
        Metric: "Total Retailers",
        Value: summaryCards.totalRetailers,
      },
      {
        Section: "Summary",
        Metric: "Reward Requests",
        Value: summaryCards.rewardRequests,
      },
      {
        Section: "Summary",
        Metric: "Total Sales",
        Value: summaryCards.totalSales,
      },
      {
        Section: "Summary",
        Metric: "Points Issued",
        Value: summaryCards.pointsIssued,
      },
    ];

    const invoiceRows = recentInvoices.map((invoice) => ({
      Section: "Recent Invoices",
      Metric: `INV-${invoice.invoice_id}`,
      Value: `${invoice.retailer_name} | ${invoice.region} | $${invoice.total_sales} | ${invoice.status}`,
    }));

    const retailerRows = topRetailers.map((retailer) => ({
      Section: "Top Retailers",
      Metric: retailer.name,
      Value: `${retailer.region} | ${retailer.tier} | ${retailer.invoice_count} invoices | $${retailer.total_sales}`,
    }));

    const rewardRows = rewardRequests.map((request) => ({
      Section: "Reward Requests",
      Metric: request.retailer_name,
      Value: `${request.gift_name} | ${request.status}`,
    }));

    downloadCsv("bm-admin-dashboard-summary.csv", [
      ...summaryRows,
      ...invoiceRows,
      ...retailerRows,
      ...rewardRows,
    ]);
  };

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            marginTop: 22,
          }}
        >
          <div>
            <h1>{t("adminDashboard")}</h1>
            <p style={{ color: "var(--text-muted)" }}>
              {t("dashboardSubtitle")}
            </p>
          </div>

          <div className="no-print" style={{ display: "flex", gap: 12 }}>
            <button
              className="secondary-btn"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </button>

            <button
              className="secondary-btn"
              onClick={handleExportDashboardCsv}
              disabled={!dashboardData}
            >
              {t("exportCsv")}
            </button>

            <button className="primary-btn" onClick={printPage}>
              {t("printSavePdf")}
            </button>
          </div>
        </div>

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            Loading dashboard data from Postgres...
          </div>
        )}

        {error && (
          <div
            className="card"
            style={{
              marginTop: 24,
              borderColor: "var(--danger-text)",
              color: "var(--danger-text)",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && summaryCards && dashboardData && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 20,
                marginTop: 24,
              }}
            >
              <StatCard
                title={t("pendingInvoices")}
                value={summaryCards.pendingInvoices}
                subtitle={t("needReview")}
              />
              <StatCard
                title={t("totalInvoices")}
                value={summaryCards.totalInvoices}
                subtitle={t("allSubmissions")}
              />
              <StatCard
                title={t("totalRetailers")}
                value={summaryCards.totalRetailers}
                subtitle={t("registeredRetailers")}
              />
              <StatCard
                title={t("rewardRequests")}
                value={summaryCards.rewardRequests}
                subtitle={t("pendingOrActive")}
              />
              <StatCard
                title="Total Sales"
                value={formattedTotalSales}
                subtitle="Approved + active invoices"
              />
              <StatCard
                title="Points Issued"
                value={summaryCards.pointsIssued.toLocaleString()}
                subtitle="From invoice rewards"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: 20,
                marginTop: 24,
              }}
            >
              <SalesChart salesOverTime={dashboardData.salesOverTime} />
              <TierRegionChart data={dashboardData.tierCompositionByRegion} />
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
                <h2>{t("recentInvoices")}</h2>

                {recentInvoices.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    No invoices available yet.
                  </p>
                ) : (
                  recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.invoice_id}
                      to={`/invoices/${invoice.invoice_id}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--border-soft)",
                        padding: "14px 0",
                        color: "inherit",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <strong>INV-{invoice.invoice_id}</strong>
                        <p
                          style={{
                            margin: "4px 0",
                            color: "var(--text-muted)",
                          }}
                        >
                          {invoice.retailer_name} · {invoice.region} · $
                          {Number(invoice.total_sales).toLocaleString()}
                        </p>
                      </div>

                      <span className={`status-pill ${getInvoiceStatusClass(invoice.status)}`}>
                        {formatStatus(invoice.status)}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <div className="card">
                <h2>{t("topRetailers")}</h2>

                {topRetailers.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    No retailer data available yet.
                  </p>
                ) : (
                  topRetailers.map((retailer) => (
                    <div
                      key={retailer.user_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--border-soft)",
                        padding: "14px 0",
                      }}
                    >
                      <div>
                        <strong>{retailer.name}</strong>
                        <p
                          style={{
                            margin: "4px 0",
                            color: "var(--text-muted)",
                          }}
                        >
                          {retailer.region} · {retailer.tier} ·{" "}
                          {retailer.invoice_count} invoices
                        </p>
                      </div>

                      <strong>
                        ${Number(retailer.total_sales).toLocaleString()}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
              <h2>{t("rewardRequests")}</h2>

              {rewardRequests.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No reward requests available yet.
                </p>
              ) : (
                rewardRequests.map((request) => (
                  <div
                    key={request.order_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-soft)",
                      padding: "14px 0",
                    }}
                  >
                    <span>
                      {request.retailer_name} requested{" "}
                      <strong>{request.gift_name}</strong>
                    </span>
                    <span>{request.status}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}