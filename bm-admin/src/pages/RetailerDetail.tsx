// import { useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   Mail,
//   MapPin,
//   Phone,
//   ReceiptText,
//   ShoppingBag,
//   Sparkles,
// } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   ScatterChart,
//   Scatter,
//   ZAxis,
// } from "recharts";
// import AdminLayout from "../components/AdminLayout";
// import { invoices, retailers } from "../data/mockData";
// import { downloadCsv, printPage } from "../utils/exportUtils";


// type ActivityRange = "week" | "month";

// export default function RetailerDetail() {
//   const { retailerId } = useParams();
//   const [activityRange, setActivityRange] = useState<ActivityRange>("week");

//   const retailer = retailers.find(
//     (item) => item.id === retailerId || String(item.user_id) === retailerId
//   );

//   const retailerInvoices = useMemo(() => {
//     if (!retailer) return [];

//     return invoices.filter(
//       (invoice) =>
//         invoice.retailer === retailer.name ||
//         invoice.retailer === retailer.store_name ||
//         invoice.retailer === retailer.id
//     );
//   }, [retailer]);

//   const recentProducts = useMemo(() => {
//     const productMap = new Map<string, { product: string; quantity: number; points: number }>();

//     retailerInvoices.forEach((invoice) => {
//       const existing = productMap.get(invoice.product);

//       if (existing) {
//         existing.quantity += invoice.quantity;
//         existing.points += invoice.points;
//       } else {
//         productMap.set(invoice.product, {
//           product: invoice.product,
//           quantity: invoice.quantity,
//           points: invoice.points,
//         });
//       }
//     });

//     return Array.from(productMap.values());
//   }, [retailerInvoices]);

//   const handleExportRetailerCsv = () => {
//     if (!retailer) return;

//     const profileRows = [
//       {
//         Section: "Retailer Profile",
//         Field: "Retailer ID",
//         Value: retailer.id ?? retailer.user_id ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Name",
//         Value: retailer.name ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Store Name",
//         Value: retailer.store_name ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Assigned TCE",
//         Value: retailer.assigned_tce_id ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Tier",
//         Value: retailer.tier ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Points",
//         Value: retailer.points ?? 0,
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Region",
//         Value: retailer.region ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Location",
//         Value: retailer.location ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Phone",
//         Value: retailer.phone_number ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Email",
//         Value: retailer.email ?? "",
//       },
//       {
//         Section: "Retailer Profile",
//         Field: "Last Login",
//         Value: retailer.last_login ?? "",
//       },
//       {
//         Section: "Retailer Metrics",
//         Field: "Total Sales",
//         Value: retailer.total_sales ?? 0,
//       },
//       {
//         Section: "Retailer Metrics",
//         Field: "Invoice Count",
//         Value: retailer.invoice_count ?? 0,
//       },
//       {
//         Section: "Retailer Metrics",
//         Field: "Registered At",
//         Value: retailer.registered_at ?? "",
//       },
//     ];

//     const invoiceRows = retailerInvoices.map((invoice) => ({
//       Section: "Recent Invoices",
//       Field: invoice.id,
//       Value: `${invoice.product} | Qty: ${invoice.quantity} | Points: ${invoice.points} | Status: ${invoice.status} | Submitted: ${invoice.submittedAt}`,
//     }));

//     const productRows = recentProducts.map((item) => ({
//       Section: "Recent Products",
//       Field: item.product,
//       Value: `Quantity: ${item.quantity} | Points: ${item.points}`,
//     }));

//     const safeName = String(retailer.name || "retailer")
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-|-$)/g, "");

//     downloadCsv(`bm-retailer-${safeName}-details.csv`, [
//       ...profileRows,
//       ...invoiceRows,
//       ...productRows,
//     ]);
//   };

//   if (!retailer) {
//     return (
//       <AdminLayout>
//         <div className="page">
//           <Link to="/retailers" style={backLinkStyle}>
//             <ArrowLeft size={18} />
//             Back to Retailers
//           </Link>

//           <div className="card" style={{ marginTop: 24 }}>
//             <h1>Retailer not found</h1>
//             <p style={{ color: "var(--text-muted)" }}>
//               This retailer does not exist in the current mock dataset.
//             </p>
//           </div>
//         </div>
//       </AdminLayout>
//     );
//   }

//   const pointsHistory = buildPointsHistory(retailer.points);
//   const activityData =
//     activityRange === "week" ? weeklyActivityData : monthlyActivityData;

//   return (
//     <AdminLayout>
//       <div className="page">
//       <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             gap: 16,
//             alignItems: "center",
//           }}
//         >
//           <Link to="/retailers" style={backLinkStyle}>
//             <ArrowLeft size={18} />
//             Back to Retailers
//           </Link>

//           <div className="no-print" style={{ display: "flex", gap: 12 }}>
//             <button className="secondary-btn" onClick={handleExportRetailerCsv}>
//               Export CSV
//             </button>

//             <button className="primary-btn" onClick={printPage}>
//               Print / Save PDF
//             </button>
//           </div>
//         </div>

//         <div
//           style={{
//             marginTop: 24,
//             display: "grid",
//             gridTemplateColumns: "1.2fr 0.8fr",
//             gap: 24,
//             alignItems: "stretch",
//           }}
//         >
//           <div className="card">
//             <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
//               <div
//                 style={{
//                   width: 88,
//                   height: 88,
//                   borderRadius: "50%",
//                   background:
//                     "linear-gradient(135deg, var(--agricare-green), var(--polymers-sky-blue))",
//                   display: "grid",
//                   placeItems: "center",
//                   color: "white",
//                   fontSize: 34,
//                   fontWeight: 900,
//                   overflow: "hidden",
//                 }}
//               >
//                 {retailer.profile_image ? (
//                   <img
//                     src={retailer.profile_image}
//                     alt={retailer.name}
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                   />
//                 ) : (
//                   retailer.name.charAt(0)
//                 )}
//               </div>

//               <div>
//                 <p style={{ margin: 0, color: "var(--text-muted)" }}>
//                   {retailer.id} · Assigned TCE #{retailer.assigned_tce_id}
//                 </p>
//                 <h1 style={{ margin: "6px 0" }}>{retailer.name}</h1>
//                 <p style={{ margin: 0, color: "var(--text-muted)" }}>
//                   {retailer.store_name}
//                 </p>

//                 <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
//                   <TierBadge tier={retailer.tier} />
//                   <StatusBadge label="Active Retailer" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <h2 style={{ marginTop: 0 }}>Current Points</h2>
//             <div
//               style={{
//                 fontSize: 44,
//                 fontWeight: 900,
//                 color: "var(--bm-blue)",
//                 marginTop: 12,
//               }}
//             >
//               {retailer.points.toLocaleString()}
//             </div>
//             <p style={{ color: "var(--text-muted)" }}>
//               Lifetime points earned through approved invoices and reward
//               activity.
//             </p>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 20,
//             marginTop: 24,
//           }}
//         >
//           <InfoCard
//             icon={<MapPin size={20} />}
//             label="Region / Location"
//             value={`${retailer.region} · ${retailer.location}`}
//           />
//           <InfoCard
//             icon={<Phone size={20} />}
//             label="Phone"
//             value={retailer.phone_number}
//           />
//           <InfoCard
//             icon={<Mail size={20} />}
//             label="Email"
//             value={retailer.email}
//           />
//           <InfoCard
//             icon={<Clock size={20} />}
//             label="Last Login"
//             value={retailer.last_login}
//           />
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 20,
//             marginTop: 20,
//           }}
//         >
//           <MetricCard
//             title="Total Sales"
//             value={`$${retailer.total_sales.toLocaleString()}`}
//           />
//           <MetricCard title="Invoice Count" value={retailer.invoice_count} />
//           <MetricCard title="Recent Invoices" value={retailerInvoices.length} />
//           <MetricCard title="Registered" value={retailer.registered_at} />
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1.1fr 0.9fr",
//             gap: 24,
//             marginTop: 24,
//           }}
//         >
//           <div className="card">
//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <div>
//                 <h2 style={{ marginTop: 0 }}>Points History</h2>
//                 <p style={{ color: "var(--text-muted)" }}>
//                   Mock trend of retailer points over time.
//                 </p>
//               </div>
//             </div>

//             <div style={{ height: 320 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={pointsHistory}>
//                   <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Line
//                     type="monotone"
//                     dataKey="points"
//                     stroke="#06357a"
//                     strokeWidth={3}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 7 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="card">
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 gap: 14,
//                 alignItems: "flex-start",
//               }}
//             >
//               <div>
//                 <h2 style={{ marginTop: 0 }}>Activity Density</h2>
//                 <p style={{ color: "var(--text-muted)" }}>
//                   Each dot represents one app opening event.
//                 </p>
//               </div>

//               <select
//                 value={activityRange}
//                 onChange={(e) => setActivityRange(e.target.value as ActivityRange)}
//                 style={selectStyle}
//               >
//                 <option value="week">Week</option>
//                 <option value="month">Month</option>
//               </select>
//             </div>

//             <div style={{ height: 320 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <ScatterChart>
//                   <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
//                   <XAxis
//                     dataKey="hour"
//                     type="number"
//                     name="Hour"
//                     domain={[0, 24]}
//                     ticks={[0, 4, 8, 12, 16, 20, 24]}
//                     label={{
//                       value: "Hour of Day",
//                       position: "insideBottom",
//                       offset: -4,
//                     }}
//                   />
//                   <YAxis
//                     dataKey="day"
//                     type="number"
//                     name="Day"
//                     domain={[0, activityRange === "week" ? 7 : 30]}
//                     reversed
//                     label={{
//                       value: activityRange === "week" ? "Day of Week" : "Day of Month",
//                       angle: -90,
//                       position: "insideLeft",
//                     }}
//                   />
//                   <ZAxis dataKey="intensity" range={[60, 160]} />
//                   <Tooltip
//                     cursor={{ strokeDasharray: "3 3" }}
//                     formatter={(value, name) => {
//                       if (name === "hour") return [`${value}:00`, "Hour"];
//                       if (name === "day") return [value, "Day"];
//                       return [value, name];
//                     }}
//                   />
//                   <Scatter
//                     name="App Opens"
//                     data={activityData}
//                     fill="#6799c8"
//                     opacity={0.55}
//                   />
//                 </ScatterChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 24,
//             marginTop: 24,
//           }}
//         >
//           <div className="card">
//             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//               <ShoppingBag color="var(--agricare-green)" />
//               <h2 style={{ margin: 0 }}>Recent Products</h2>
//             </div>

//             {recentProducts.length > 0 ? (
//               recentProducts.map((item) => (
//                 <div
//                   key={item.product}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     borderTop: "1px solid #eee",
//                     padding: "14px 0",
//                   }}
//                 >
//                   <div>
//                     <strong>{item.product}</strong>
//                     <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
//                       Quantity purchased: {item.quantity}
//                     </p>
//                   </div>
//                   <strong>{item.points} pts</strong>
//                 </div>
//               ))
//             ) : (
//               <EmptyState text="No recent product activity yet." />
//             )}
//           </div>

//           <div className="card">
//             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//               <ReceiptText color="var(--bm-blue)" />
//               <h2 style={{ margin: 0 }}>Recent Invoices</h2>
//             </div>

//             {retailerInvoices.length > 0 ? (
//               retailerInvoices.map((invoice) => (
//                 <Link
//                   key={invoice.id}
//                   to={`/invoices/${invoice.id}`}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     borderTop: "1px solid #eee",
//                     padding: "14px 0",
//                     color: "inherit",
//                     textDecoration: "none",
//                   }}
//                 >
//                   <div>
//                     <strong>{invoice.id}</strong>
//                     <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
//                       {invoice.product} · Qty {invoice.quantity} ·{" "}
//                       {invoice.submittedAt}
//                     </p>
//                   </div>
//                   <StatusPill status={invoice.status} />
//                 </Link>
//               ))
//             ) : (
//               <EmptyState text="No recent invoices found for this retailer." />
//             )}
//           </div>
//         </div>

//         <div className="card" style={{ marginTop: 24 }}>
//           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//             <Sparkles color="var(--chemicals-yellow)" />
//             <h2 style={{ margin: 0 }}>Admin Notes</h2>
//           </div>

//           <textarea
//             placeholder="Add internal notes about this retailer..."
//             style={{
//               marginTop: 16,
//               width: "100%",
//               minHeight: 120,
//               borderRadius: 16,
//               border: "1px solid var(--border)",
//               padding: 14,
//               resize: "vertical",
//               outline: "none",
//             }}
//           />

//           <button className="primary-btn" style={{ marginTop: 12 }}>
//             Save Notes
//           </button>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }

// function InfoCard({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="card">
//       <div style={{ color: "var(--bm-blue)" }}>{icon}</div>
//       <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
//       <strong>{value}</strong>
//     </div>
//   );
// }

// function MetricCard({
//   title,
//   value,
// }: {
//   title: string;
//   value: string | number;
// }) {
//   return (
//     <div className="card">
//       <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
//         {title}
//       </p>
//       <h2 style={{ margin: "10px 0 0", color: "var(--bm-blue)" }}>{value}</h2>
//     </div>
//   );
// }

// function TierBadge({ tier }: { tier: string }) {
//   const normalizedTier = tier.toLowerCase();

//   const stylesByTier: Record<string, { background: string; color: string }> = {
//     bronze: {
//       background: "rgba(205, 127, 50, 0.16)",
//       color: "#8a4b12",
//     },
//     silver: {
//       background: "rgba(128, 127, 131, 0.15)",
//       color: "#55545a",
//     },
//     gold: {
//       background: "rgba(251, 176, 52, 0.18)",
//       color: "#9a6700",
//     },
//     premium: {
//       background: "rgba(6, 53, 122, 0.12)",
//       color: "var(--bm-blue)",
//     },
//   };

//   const tierStyle = stylesByTier[normalizedTier] ?? {
//     background: "rgba(103, 153, 200, 0.15)",
//     color: "var(--bm-blue)",
//   };

//   return (
//     <span
//       style={{
//         ...tierStyle,
//         padding: "6px 10px",
//         borderRadius: 999,
//         fontSize: 13,
//         fontWeight: 800,
//       }}
//     >
//       {tier}
//     </span>
//   );
// }

// function StatusBadge({ label }: { label: string }) {
//   return (
//     <span
//       style={{
//         background: "rgba(122, 193, 67, 0.15)",
//         color: "#2f7d32",
//         padding: "6px 10px",
//         borderRadius: 999,
//         fontSize: 13,
//         fontWeight: 800,
//       }}
//     >
//       {label}
//     </span>
//   );
// }

// function StatusPill({ status }: { status: string }) {
//   const normalizedStatus = status.toLowerCase();

//   const isApproved = normalizedStatus === "approved";
//   const isRejected = normalizedStatus === "rejected";

//   return (
//     <span
//       style={{
//         height: "fit-content",
//         padding: "6px 10px",
//         borderRadius: 999,
//         fontSize: 13,
//         fontWeight: 800,
//         background: isApproved
//           ? "rgba(122, 193, 67, 0.15)"
//           : isRejected
//           ? "rgba(227, 27, 35, 0.12)"
//           : "rgba(251, 176, 52, 0.18)",
//         color: isApproved
//           ? "#2f7d32"
//           : isRejected
//           ? "#e31b23"
//           : "#9a6700",
//       }}
//     >
//       {status}
//     </span>
//   );
// }

// function EmptyState({ text }: { text: string }) {
//   return (
//     <div
//       style={{
//         marginTop: 14,
//         borderTop: "1px solid #eee",
//         padding: "20px 0",
//         color: "var(--text-muted)",
//       }}
//     >
//       {text}
//     </div>
//   );
// }

// function buildPointsHistory(currentPoints: number) {
//   const base = Math.max(0, currentPoints - 600);

//   return [
//     { date: "Mar 1", points: base },
//     { date: "Mar 15", points: base + 90 },
//     { date: "Apr 1", points: base + 180 },
//     { date: "Apr 15", points: base + 260 },
//     { date: "May 1", points: base + 420 },
//     { date: "May 8", points: currentPoints },
//   ];
// }

// const weeklyActivityData = [
//   { day: 1, hour: 8, intensity: 1 },
//   { day: 1, hour: 12, intensity: 1 },
//   { day: 1, hour: 19, intensity: 1 },
//   { day: 2, hour: 9, intensity: 1 },
//   { day: 2, hour: 15, intensity: 1 },
//   { day: 3, hour: 8, intensity: 1 },
//   { day: 3, hour: 11, intensity: 1 },
//   { day: 3, hour: 20, intensity: 1 },
//   { day: 4, hour: 10, intensity: 1 },
//   { day: 5, hour: 14, intensity: 1 },
//   { day: 6, hour: 16, intensity: 1 },
//   { day: 7, hour: 9, intensity: 1 },
// ];

// const monthlyActivityData = [
//   { day: 1, hour: 8, intensity: 1 },
//   { day: 2, hour: 9, intensity: 1 },
//   { day: 3, hour: 19, intensity: 1 },
//   { day: 4, hour: 14, intensity: 1 },
//   { day: 5, hour: 8, intensity: 1 },
//   { day: 6, hour: 16, intensity: 1 },
//   { day: 7, hour: 10, intensity: 1 },
//   { day: 9, hour: 11, intensity: 1 },
//   { day: 10, hour: 18, intensity: 1 },
//   { day: 12, hour: 7, intensity: 1 },
//   { day: 13, hour: 15, intensity: 1 },
//   { day: 15, hour: 20, intensity: 1 },
//   { day: 17, hour: 9, intensity: 1 },
//   { day: 18, hour: 13, intensity: 1 },
//   { day: 20, hour: 16, intensity: 1 },
//   { day: 22, hour: 10, intensity: 1 },
//   { day: 24, hour: 17, intensity: 1 },
//   { day: 25, hour: 8, intensity: 1 },
//   { day: 27, hour: 12, intensity: 1 },
//   { day: 29, hour: 19, intensity: 1 },
// ];

// const backLinkStyle: React.CSSProperties = {
//   display: "inline-flex",
//   alignItems: "center",
//   gap: 8,
//   color: "var(--bm-blue)",
//   fontWeight: 800,
//   textDecoration: "none",
// };

// const selectStyle: React.CSSProperties = {
//   border: "1px solid var(--border)",
//   borderRadius: 12,
//   padding: "10px 12px",
//   background: "white",
//   color: "var(--text-main)",
//   outline: "none",
// };
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  getRetailerDetail,
  type RetailerDetailResponse,
} from "../services/adminRetailersApi";

function formatVnd(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatStatus(status?: string | null) {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RetailerDetail() {
  const { retailerId } = useParams();

  const [data, setData] = useState<RetailerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRetailer() {
      if (!retailerId) return;

      setLoading(true);
      setError("");

      try {
        const result = await getRetailerDetail(retailerId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load retailer.");
      } finally {
        setLoading(false);
      }
    }

    loadRetailer();
  }, [retailerId]);

  const retailer = data?.retailer;

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div style={{ marginTop: 22 }}>
          <Link to="/retailers" style={backLinkStyle}>
            ← Back to Retailers
          </Link>

          <h1>Retailer Profile</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
            Retailer account details, invoice history, reward activity, and
            inferred business engagement.
          </p>
        </div>

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            Loading retailer from Postgres...
          </div>
        )}

        {error && (
          <div
            className="card"
            style={{
              marginTop: 24,
              color: "var(--danger-text)",
              borderColor: "var(--danger-text)",
            }}
          >
            {error}
          </div>
        )}

        {retailer && data && (
          <>
            <section className="card" style={profileCardStyle}>
              <div style={avatarStyle}>{initials(retailer.name)}</div>

              <div>
                <p style={eyebrowStyle}>Retailer</p>
                <h1 style={{ margin: "4px 0" }}>{retailer.name}</h1>
                <p style={{ color: "var(--text-muted)", margin: 0 }}>
                  {retailer.region} · {retailer.tier} · {retailer.phone_number}
                </p>

                <p style={{ marginTop: 14, lineHeight: 1.6 }}>
                  {retailer.name} is a {retailer.tier} retailer in{" "}
                  {retailer.region}. This profile summarizes their points,
                  invoices, reward redemptions, and latest business activity.
                </p>
              </div>
            </section>

            <div style={statsGridStyle}>
              <StatBox
                title="Total Sales"
                value={formatVnd(retailer.total_sales)}
                subtitle={`${retailer.invoice_count} invoices`}
              />
              <StatBox
                title="Total Points"
                value={Number(retailer.total_points || 0).toLocaleString()}
                subtitle="Current account points"
              />
              <StatBox
                title="Invoice Points"
                value={Number(retailer.invoice_points || 0).toLocaleString()}
                subtitle="Calculated from invoices"
              />
              <StatBox
                title="Redemptions"
                value={retailer.redemption_count}
                subtitle={`Last: ${formatDate(retailer.last_redemption_at)}`}
              />
            </div>

            <div style={twoColumnGridStyle}>
              <section className="card">
                <h2>Recent Invoices</h2>

                {data.recentInvoices.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    No invoices found.
                  </p>
                ) : (
                  data.recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.invoice_id}
                      to={`/invoices/${invoice.invoice_id}`}
                      style={activityRowStyle}
                    >
                      <div>
                        <strong>
                          {invoice.invoice_number || invoice.invoice_id.slice(0, 8)}
                        </strong>
                        <p style={mutedSmallTextStyle}>
                          {formatDate(invoice.created_at)} ·{" "}
                          {formatStatus(invoice.admin_status || invoice.status)}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <strong>{Number(invoice.points || 0).toLocaleString()} pts</strong>
                        <p style={mutedSmallTextStyle}>
                          {formatVnd(invoice.total_sales)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </section>

              <section className="card">
                <h2>Recent Reward Redemptions</h2>

                {data.recentRedemptions.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    No reward redemptions found.
                  </p>
                ) : (
                  data.recentRedemptions.map((redemption) => (
                    <div key={redemption.redemption_id} style={activityRowStyle}>
                      <div>
                        <strong>{redemption.reward_items}</strong>
                        <p style={mutedSmallTextStyle}>
                          {formatDate(redemption.created_at)} ·{" "}
                          {formatStatus(redemption.status)}
                        </p>
                      </div>

                      <strong>
                        {Number(redemption.total_points || 0).toLocaleString()} pts
                      </strong>
                    </div>
                  ))
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatBox({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <p style={eyebrowStyle}>{title}</p>
      <strong style={{ display: "block", marginTop: 10, fontSize: "1.8rem" }}>
        {value}
      </strong>
      <p style={{ margin: "10px 0 0", color: "var(--text-muted)" }}>
        {subtitle}
      </p>
    </div>
  );
}

const backLinkStyle: CSSProperties = {
  color: "var(--text-brand-readable)",
  fontWeight: 800,
  textDecoration: "none",
};

const profileCardStyle: CSSProperties = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 24,
  alignItems: "center",
};

const avatarStyle: CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  background:
    "linear-gradient(135deg, rgba(6,53,122,0.95), rgba(103,153,200,0.9))",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontSize: 36,
  fontWeight: 900,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontWeight: 800,
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 20,
  marginTop: 24,
};

const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 24,
};

const activityRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  borderTop: "1px solid var(--border-soft)",
  padding: "14px 0",
  color: "inherit",
  textDecoration: "none",
};

const mutedSmallTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "var(--text-muted)",
  fontSize: "0.82rem",
};