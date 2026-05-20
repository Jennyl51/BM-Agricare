import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import AdminLayout from "../components/AdminLayout";
import { invoices, retailers } from "../data/mockData";

type ActivityRange = "week" | "month";

export default function RetailerDetail() {
  const { retailerId } = useParams();
  const [activityRange, setActivityRange] = useState<ActivityRange>("week");

  const retailer = retailers.find(
    (item) => item.id === retailerId || String(item.user_id) === retailerId
  );

  const retailerInvoices = useMemo(() => {
    if (!retailer) return [];

    return invoices.filter(
      (invoice) =>
        invoice.retailer === retailer.name ||
        invoice.retailer === retailer.store_name ||
        invoice.retailer === retailer.id
    );
  }, [retailer]);

  const recentProducts = useMemo(() => {
    const productMap = new Map<string, { product: string; quantity: number; points: number }>();

    retailerInvoices.forEach((invoice) => {
      const existing = productMap.get(invoice.product);

      if (existing) {
        existing.quantity += invoice.quantity;
        existing.points += invoice.points;
      } else {
        productMap.set(invoice.product, {
          product: invoice.product,
          quantity: invoice.quantity,
          points: invoice.points,
        });
      }
    });

    return Array.from(productMap.values());
  }, [retailerInvoices]);

  if (!retailer) {
    return (
      <AdminLayout>
        <div className="page">
          <Link to="/retailers" style={backLinkStyle}>
            <ArrowLeft size={18} />
            Back to Retailers
          </Link>

          <div className="card" style={{ marginTop: 24 }}>
            <h1>Retailer not found</h1>
            <p style={{ color: "var(--text-muted)" }}>
              This retailer does not exist in the current mock dataset.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const pointsHistory = buildPointsHistory(retailer.points);
  const activityData =
    activityRange === "week" ? weeklyActivityData : monthlyActivityData;

  return (
    <AdminLayout>
      <div className="page">
        <Link to="/retailers" style={backLinkStyle}>
          <ArrowLeft size={18} />
          Back to Retailers
        </Link>

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div className="card">
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--agricare-green), var(--polymers-sky-blue))",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 34,
                  fontWeight: 900,
                  overflow: "hidden",
                }}
              >
                {retailer.profile_image ? (
                  <img
                    src={retailer.profile_image}
                    alt={retailer.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  retailer.name.charAt(0)
                )}
              </div>

              <div>
                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                  {retailer.id} · Assigned TCE #{retailer.assigned_tce_id}
                </p>
                <h1 style={{ margin: "6px 0" }}>{retailer.name}</h1>
                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                  {retailer.store_name}
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <TierBadge tier={retailer.tier} />
                  <StatusBadge label="Active Retailer" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Current Points</h2>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: "var(--bm-blue)",
                marginTop: 12,
              }}
            >
              {retailer.points.toLocaleString()}
            </div>
            <p style={{ color: "var(--text-muted)" }}>
              Lifetime points earned through approved invoices and reward
              activity.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginTop: 24,
          }}
        >
          <InfoCard
            icon={<MapPin size={20} />}
            label="Region / Location"
            value={`${retailer.region} · ${retailer.location}`}
          />
          <InfoCard
            icon={<Phone size={20} />}
            label="Phone"
            value={retailer.phone_number}
          />
          <InfoCard
            icon={<Mail size={20} />}
            label="Email"
            value={retailer.email}
          />
          <InfoCard
            icon={<Clock size={20} />}
            label="Last Login"
            value={retailer.last_login}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginTop: 20,
          }}
        >
          <MetricCard
            title="Total Sales"
            value={`$${retailer.total_sales.toLocaleString()}`}
          />
          <MetricCard title="Invoice Count" value={retailer.invoice_count} />
          <MetricCard title="Recent Invoices" value={retailerInvoices.length} />
          <MetricCard title="Registered" value={retailer.registered_at} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ marginTop: 0 }}>Points History</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Mock trend of retailer points over time.
                </p>
              </div>
            </div>

            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pointsHistory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#06357a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div>
                <h2 style={{ marginTop: 0 }}>Activity Density</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Each dot represents one app opening event.
                </p>
              </div>

              <select
                value={activityRange}
                onChange={(e) => setActivityRange(e.target.value as ActivityRange)}
                style={selectStyle}
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
                  <XAxis
                    dataKey="hour"
                    type="number"
                    name="Hour"
                    domain={[0, 24]}
                    ticks={[0, 4, 8, 12, 16, 20, 24]}
                    label={{
                      value: "Hour of Day",
                      position: "insideBottom",
                      offset: -4,
                    }}
                  />
                  <YAxis
                    dataKey="day"
                    type="number"
                    name="Day"
                    domain={[0, activityRange === "week" ? 7 : 30]}
                    reversed
                    label={{
                      value: activityRange === "week" ? "Day of Week" : "Day of Month",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ZAxis dataKey="intensity" range={[60, 160]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name) => {
                      if (name === "hour") return [`${value}:00`, "Hour"];
                      if (name === "day") return [value, "Day"];
                      return [value, name];
                    }}
                  />
                  <Scatter
                    name="App Opens"
                    data={activityData}
                    fill="#6799c8"
                    opacity={0.55}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div className="card">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <ShoppingBag color="var(--agricare-green)" />
              <h2 style={{ margin: 0 }}>Recent Products</h2>
            </div>

            {recentProducts.length > 0 ? (
              recentProducts.map((item) => (
                <div
                  key={item.product}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    padding: "14px 0",
                  }}
                >
                  <div>
                    <strong>{item.product}</strong>
                    <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
                      Quantity purchased: {item.quantity}
                    </p>
                  </div>
                  <strong>{item.points} pts</strong>
                </div>
              ))
            ) : (
              <EmptyState text="No recent product activity yet." />
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <ReceiptText color="var(--bm-blue)" />
              <h2 style={{ margin: 0 }}>Recent Invoices</h2>
            </div>

            {retailerInvoices.length > 0 ? (
              retailerInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #eee",
                    padding: "14px 0",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <strong>{invoice.id}</strong>
                    <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
                      {invoice.product} · Qty {invoice.quantity} ·{" "}
                      {invoice.submittedAt}
                    </p>
                  </div>
                  <StatusPill status={invoice.status} />
                </Link>
              ))
            ) : (
              <EmptyState text="No recent invoices found for this retailer." />
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Sparkles color="var(--chemicals-yellow)" />
            <h2 style={{ margin: 0 }}>Admin Notes</h2>
          </div>

          <textarea
            placeholder="Add internal notes about this retailer..."
            style={{
              marginTop: 16,
              width: "100%",
              minHeight: 120,
              borderRadius: 16,
              border: "1px solid var(--border)",
              padding: 14,
              resize: "vertical",
              outline: "none",
            }}
          />

          <button className="primary-btn" style={{ marginTop: 12 }}>
            Save Notes
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card">
      <div style={{ color: "var(--bm-blue)" }}>{icon}</div>
      <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="card">
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
        {title}
      </p>
      <h2 style={{ margin: "10px 0 0", color: "var(--bm-blue)" }}>{value}</h2>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const normalizedTier = tier.toLowerCase();

  const stylesByTier: Record<string, { background: string; color: string }> = {
    bronze: {
      background: "rgba(205, 127, 50, 0.16)",
      color: "#8a4b12",
    },
    silver: {
      background: "rgba(128, 127, 131, 0.15)",
      color: "#55545a",
    },
    gold: {
      background: "rgba(251, 176, 52, 0.18)",
      color: "#9a6700",
    },
    premium: {
      background: "rgba(6, 53, 122, 0.12)",
      color: "var(--bm-blue)",
    },
  };

  const tierStyle = stylesByTier[normalizedTier] ?? {
    background: "rgba(103, 153, 200, 0.15)",
    color: "var(--bm-blue)",
  };

  return (
    <span
      style={{
        ...tierStyle,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      {tier}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        background: "rgba(122, 193, 67, 0.15)",
        color: "#2f7d32",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const isApproved = normalizedStatus === "approved";
  const isRejected = normalizedStatus === "rejected";

  return (
    <span
      style={{
        height: "fit-content",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        background: isApproved
          ? "rgba(122, 193, 67, 0.15)"
          : isRejected
          ? "rgba(227, 27, 35, 0.12)"
          : "rgba(251, 176, 52, 0.18)",
        color: isApproved
          ? "#2f7d32"
          : isRejected
          ? "#e31b23"
          : "#9a6700",
      }}
    >
      {status}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: 14,
        borderTop: "1px solid #eee",
        padding: "20px 0",
        color: "var(--text-muted)",
      }}
    >
      {text}
    </div>
  );
}

function buildPointsHistory(currentPoints: number) {
  const base = Math.max(0, currentPoints - 600);

  return [
    { date: "Mar 1", points: base },
    { date: "Mar 15", points: base + 90 },
    { date: "Apr 1", points: base + 180 },
    { date: "Apr 15", points: base + 260 },
    { date: "May 1", points: base + 420 },
    { date: "May 8", points: currentPoints },
  ];
}

const weeklyActivityData = [
  { day: 1, hour: 8, intensity: 1 },
  { day: 1, hour: 12, intensity: 1 },
  { day: 1, hour: 19, intensity: 1 },
  { day: 2, hour: 9, intensity: 1 },
  { day: 2, hour: 15, intensity: 1 },
  { day: 3, hour: 8, intensity: 1 },
  { day: 3, hour: 11, intensity: 1 },
  { day: 3, hour: 20, intensity: 1 },
  { day: 4, hour: 10, intensity: 1 },
  { day: 5, hour: 14, intensity: 1 },
  { day: 6, hour: 16, intensity: 1 },
  { day: 7, hour: 9, intensity: 1 },
];

const monthlyActivityData = [
  { day: 1, hour: 8, intensity: 1 },
  { day: 2, hour: 9, intensity: 1 },
  { day: 3, hour: 19, intensity: 1 },
  { day: 4, hour: 14, intensity: 1 },
  { day: 5, hour: 8, intensity: 1 },
  { day: 6, hour: 16, intensity: 1 },
  { day: 7, hour: 10, intensity: 1 },
  { day: 9, hour: 11, intensity: 1 },
  { day: 10, hour: 18, intensity: 1 },
  { day: 12, hour: 7, intensity: 1 },
  { day: 13, hour: 15, intensity: 1 },
  { day: 15, hour: 20, intensity: 1 },
  { day: 17, hour: 9, intensity: 1 },
  { day: 18, hour: 13, intensity: 1 },
  { day: 20, hour: 16, intensity: 1 },
  { day: 22, hour: 10, intensity: 1 },
  { day: 24, hour: 17, intensity: 1 },
  { day: 25, hour: 8, intensity: 1 },
  { day: 27, hour: 12, intensity: 1 },
  { day: 29, hour: 19, intensity: 1 },
];

const backLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "var(--bm-blue)",
  fontWeight: 800,
  textDecoration: "none",
};

const selectStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "white",
  color: "var(--text-main)",
  outline: "none",
};