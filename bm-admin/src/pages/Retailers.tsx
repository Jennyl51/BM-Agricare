import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Grid3X3, List, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  getRetailersOverview,
  type AdminRetailer,
  type RetailerSummary,
} from "../services/adminRetailersApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

type ViewMode = "list" | "gallery";
type SortOption = "name" | "points" | "sales" | "invoices" | "recent";

const PAGE_SIZE = 12;

function formatVnd(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatDate(value?: string | null) {
  if (!value || value.startsWith("1970-01-01")) return "—";

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

function tierRank(tier: string) {
  const normalized = tier.toLowerCase();

  if (normalized === "diamond" || normalized === "premium") return 4;
  if (normalized === "gold") return 3;
  if (normalized === "silver") return 2;
  return 1;
}

export default function Retailers() {
  const { t } = useAppPreferences();

  const [retailers, setRetailers] = useState<AdminRetailer[]>([]);
  const [summary, setSummary] = useState<RetailerSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRetailers() {
    setLoading(true);
    setError("");

    try {
      const data = await getRetailersOverview();
      setSummary(data.summary);
      setRetailers(data.retailers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load retailers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRetailers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, regionFilter, tierFilter, sortBy, viewMode]);

  const regions = useMemo(() => {
    return Array.from(
      new Set(retailers.map((retailer) => retailer.region).filter(Boolean))
    ).sort();
  }, [retailers]);

  const tiers = useMemo(() => {
    return Array.from(
      new Set(retailers.map((retailer) => retailer.tier).filter(Boolean))
    ).sort((a, b) => tierRank(b) - tierRank(a));
  }, [retailers]);

  const filteredRetailers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return [...retailers]
      .filter((retailer) => {
        const matchesSearch =
          retailer.retailer_id.toLowerCase().includes(normalizedSearch) ||
          retailer.name.toLowerCase().includes(normalizedSearch) ||
          retailer.phone_number.toLowerCase().includes(normalizedSearch) ||
          retailer.region.toLowerCase().includes(normalizedSearch) ||
          retailer.tier.toLowerCase().includes(normalizedSearch);

        const matchesRegion =
          regionFilter === "all" || retailer.region === regionFilter;

        const matchesTier = tierFilter === "all" || retailer.tier === tierFilter;

        return matchesSearch && matchesRegion && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "points") {
          return Number(b.total_points || 0) - Number(a.total_points || 0);
        }

        if (sortBy === "sales") {
          return Number(b.total_sales || 0) - Number(a.total_sales || 0);
        }

        if (sortBy === "invoices") {
          return Number(b.invoice_count || 0) - Number(a.invoice_count || 0);
        }

        if (sortBy === "recent") {
          return (
            new Date(b.last_business_activity_at || 0).getTime() -
            new Date(a.last_business_activity_at || 0).getTime()
          );
        }

        return 0;
      });
  }, [retailers, searchTerm, regionFilter, tierFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRetailers.length / PAGE_SIZE));

  const paginatedRetailers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRetailers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRetailers, currentPage]);

  const galleryByRegion = useMemo(() => {
    const grouped: Record<string, AdminRetailer[]> = {};

    filteredRetailers.forEach((retailer) => {
      const region = retailer.region || "Unknown";

      if (!grouped[region]) {
        grouped[region] = [];
      }

      grouped[region].push(retailer);
    });

    return Object.entries(grouped).sort(([regionA], [regionB]) =>
      regionA.localeCompare(regionB)
    );
  }, [filteredRetailers]);

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            marginTop: 22,
          }}
        >
          <div>
            <h1 style={{ marginBottom: 8 }}>{t("retailers")}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Search, filter, and review retailer accounts, regions, tiers,
              invoices, points, and inferred business activity.
            </p>
          </div>

          <div style={viewToggleStyle}>
            <button
              onClick={() => setViewMode("list")}
              style={viewButtonStyle(viewMode === "list")}
            >
              <List size={17} />
              List
            </button>

            <button
              onClick={() => setViewMode("gallery")}
              style={viewButtonStyle(viewMode === "gallery")}
            >
              <Grid3X3 size={17} />
              Gallery
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatBox
            title="Total Retailers"
            value={summary?.totalRetailers || 0}
            subtitle={`${summary?.activeRegions || 0} active regions`}
          />
          <StatBox
            title="Total Sales"
            value={formatVnd(summary?.totalSales || 0)}
            subtitle={`${summary?.totalInvoices || 0} submitted invoices`}
          />
          <StatBox
            title="Total Points"
            value={(summary?.totalPoints || 0).toLocaleString()}
            subtitle="Current retailer points"
          />
          <StatBox
            title="Reward Requests"
            value={summary?.totalRedemptions || 0}
            subtitle="Redemption requests"
          />
        </div>

        <div
          className="card"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div style={searchBoxStyle}>
            <Search size={18} color="var(--text-muted)" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search ID, name, phone, region, or tier..."
              style={searchInputStyle}
            />
          </div>

          <select
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">All Tiers</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            style={selectStyle}
          >
            <option value="name">Sort by Name</option>
            <option value="points">Sort by Points</option>
            <option value="sales">Sort by Sales</option>
            <option value="invoices">Sort by Invoices</option>
            <option value="recent">Sort by Recent Activity</option>
          </select>
        </div>

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            Loading retailers from Postgres...
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

        {!loading && !error && (
          <>
            <p style={{ color: "var(--text-muted)", marginTop: 18 }}>
              Showing <strong>{filteredRetailers.length}</strong> retailer
              {filteredRetailers.length === 1 ? "" : "s"}
            </p>

            {viewMode === "list" ? (
              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 980,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          textAlign: "left",
                          color: "var(--text-muted)",
                          borderBottom: "1px solid var(--border-soft)",
                        }}
                      >
                        <th style={thStyle}>Retailer</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Region</th>
                        <th style={thStyle}>Tier</th>
                        <th style={thStyle}>Points</th>
                        <th style={thStyle}>Invoices</th>
                        <th style={thStyle}>Total Sales</th>
                        <th style={thStyle}>Last Activity</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedRetailers.map((retailer) => (
                        <tr
                          key={retailer.retailer_id}
                          style={{
                            borderBottom: "1px solid var(--border-soft)",
                          }}
                        >
                          <td style={tdStyle}>
                            <Link
                              to={`/retailers/${retailer.retailer_id}`}
                              style={rowLinkStyle}
                            >
                              <div style={{ display: "flex", gap: 12 }}>
                                <Avatar retailer={retailer} size={42} />
                                <div>
                                  <strong>{retailer.name}</strong>
                                  <p style={mutedSmallTextStyle}>
                                    {retailer.retailer_id.slice(0, 8)}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </td>

                          <td style={tdStyle}>{retailer.phone_number}</td>
                          <td style={tdStyle}>{retailer.region}</td>
                          <td style={tdStyle}>
                            <TierBadge tier={retailer.tier} />
                          </td>
                          <td style={tdStyle}>
                            {Number(retailer.total_points || 0).toLocaleString()}
                          </td>
                          <td style={tdStyle}>{retailer.invoice_count}</td>
                          <td style={tdStyle}>{formatVnd(retailer.total_sales)}</td>
                          <td style={tdStyle}>
                            {formatDate(retailer.last_business_activity_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {galleryByRegion.map(([region, regionRetailers]) => (
                  <section key={region} style={{ marginBottom: 26 }}>
                    <h2 style={{ marginBottom: 14 }}>
                      {region}{" "}
                      <span style={{ color: "var(--text-muted)", fontSize: 15 }}>
                        ({regionRetailers.length})
                      </span>
                    </h2>

                    <div style={galleryGridStyle}>
                      {regionRetailers.map((retailer) => (
                        <Link
                          key={retailer.retailer_id}
                          to={`/retailers/${retailer.retailer_id}`}
                          className="card"
                          style={galleryCardStyle}
                        >
                          <div style={galleryAvatarAreaStyle}>
                            <Avatar retailer={retailer} size={86} />
                          </div>

                          <div style={{ padding: 18 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <p style={mutedSmallTextStyle}>
                                  {retailer.retailer_id.slice(0, 8)}
                                </p>
                                <h2 style={{ margin: "6px 0 2px" }}>
                                  {retailer.name}
                                </h2>
                              </div>

                              <TierBadge tier={retailer.tier} />
                            </div>

                            <p
                              style={{
                                color: "var(--text-muted)",
                                marginTop: 10,
                                lineHeight: 1.5,
                              }}
                            >
                              {retailer.region} retailer with{" "}
                              {retailer.invoice_count} invoices and{" "}
                              {Number(retailer.total_points || 0).toLocaleString()}{" "}
                              points.
                            </p>

                            <div style={miniMetricGridStyle}>
                              <MiniMetric
                                label="Sales"
                                value={formatVnd(retailer.total_sales)}
                              />
                              <MiniMetric
                                label="Last Activity"
                                value={formatDate(
                                  retailer.last_business_activity_at
                                )}
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
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
      <p style={statTitleStyle}>{title}</p>
      <strong style={statValueStyle}>{value}</strong>
      <p style={statSubtitleStyle}>{subtitle}</p>
    </div>
  );
}

function Avatar({
  retailer,
  size,
}: {
  retailer: AdminRetailer;
  size: number;
}) {
  if (retailer.profile_image_url) {
    return (
      <img
        src={retailer.profile_image_url}
        alt={retailer.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid var(--border-soft)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, rgba(6,53,122,0.92), rgba(103,153,200,0.88))",
        color: "white",
        display: "grid",
        placeItems: "center",
        fontSize: size > 60 ? 28 : 15,
        fontWeight: 900,
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 8px 18px rgba(16, 24, 40, 0.12)",
      }}
    >
      {initials(retailer.name)}
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
    diamond: {
      background: "rgba(6, 53, 122, 0.12)",
      color: "var(--text-brand-readable)",
    },
    premium: {
      background: "rgba(6, 53, 122, 0.12)",
      color: "var(--text-brand-readable)",
    },
  };

  const tierStyle = stylesByTier[normalizedTier] ?? {
    background: "rgba(103, 153, 200, 0.15)",
    color: "var(--text-brand-readable)",
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={miniMetricStyle}>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 12 }}>
        {label}
      </p>
      <strong>{value}</strong>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div style={paginationStyle}>
      <button
        className="secondary-btn"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
      >
        ← Previous
      </button>

      <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="secondary-btn"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      >
        Next →
      </button>
    </div>
  );
}

const viewToggleStyle: CSSProperties = {
  display: "flex",
  background: "var(--bg-card)",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  overflow: "hidden",
};

function viewButtonStyle(active: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    padding: "10px 14px",
    cursor: "pointer",
    background: active ? "var(--bm-blue)" : "transparent",
    color: active ? "white" : "var(--text-brand-readable)",
    fontWeight: 700,
  };
}

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 20,
  marginTop: 24,
};

const searchBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: "0 12px",
  background: "var(--bg-card)",
};

const searchInputStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  padding: "12px 0",
  background: "transparent",
  color: "var(--text-main)",
};

const selectStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: "12px",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  outline: "none",
};

const thStyle: CSSProperties = {
  padding: "0 14px 12px 0",
  fontSize: "0.82rem",
};

const tdStyle: CSSProperties = {
  padding: "14px 14px 14px 0",
  verticalAlign: "middle",
};

const rowLinkStyle: CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 700,
};

const mutedSmallTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "var(--text-muted)",
  fontSize: "0.82rem",
};

const statTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontWeight: 800,
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

const statValueStyle: CSSProperties = {
  display: "block",
  marginTop: 10,
  fontSize: "1.8rem",
  lineHeight: 1,
};

const statSubtitleStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "var(--text-muted)",
  fontWeight: 700,
};

const galleryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 20,
};

const galleryCardStyle: CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  display: "block",
  padding: 0,
  overflow: "hidden",
};

const galleryAvatarAreaStyle: CSSProperties = {
  height: 140,
  background:
    "linear-gradient(135deg, rgba(122,193,67,0.18), rgba(103,153,200,0.24))",
  display: "grid",
  placeItems: "center",
};

const miniMetricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 18,
};

const miniMetricStyle: CSSProperties = {
  background: "var(--bg-soft)",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: 12,
};

const paginationStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
  marginTop: 20,
};