import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Grid3X3, List, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { retailers } from "../data/mockData";

type ViewMode = "list" | "gallery";
type SortOption = "id" | "name" | "points";

export default function Retailers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const regions = useMemo(() => {
    return Array.from(new Set(retailers.map((retailer) => retailer.region)));
  }, []);

  const tiers = useMemo(() => {
    return Array.from(new Set(retailers.map((retailer) => retailer.tier)));
  }, []);

  const filteredRetailers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return [...retailers]
      .filter((retailer) => {
        const matchesSearch =
          retailer.id.toLowerCase().includes(normalizedSearch) ||
          String(retailer.user_id).includes(normalizedSearch) ||
          retailer.name.toLowerCase().includes(normalizedSearch) ||
          retailer.store_name.toLowerCase().includes(normalizedSearch);

        const matchesRegion =
          regionFilter === "all" || retailer.region === regionFilter;

        const matchesTier = tierFilter === "all" || retailer.tier === tierFilter;

        return matchesSearch && matchesRegion && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === "id") {
          return a.id.localeCompare(b.id);
        }

        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "points") {
          return b.points - a.points;
        }

        return 0;
      });
  }, [searchTerm, regionFilter, tierFilter, sortBy]);

  return (
    <AdminLayout>
      <div className="page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div>
            <h1 style={{ marginBottom: 8 }}>Retailers</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Search, filter, and review retailer accounts, tiers, regions, and
              points.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                padding: "10px 14px",
                cursor: "pointer",
                background:
                  viewMode === "list" ? "var(--bm-blue)" : "transparent",
                color: viewMode === "list" ? "white" : "var(--bm-blue)",
                fontWeight: 700,
              }}
            >
              <List size={17} />
              List
            </button>

            <button
              onClick={() => setViewMode("gallery")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                padding: "10px 14px",
                cursor: "pointer",
                background:
                  viewMode === "gallery" ? "var(--bm-blue)" : "transparent",
                color: viewMode === "gallery" ? "white" : "var(--bm-blue)",
                fontWeight: 700,
              }}
            >
              <Grid3X3 size={17} />
              Gallery
            </button>
          </div>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "0 12px",
              background: "#fff",
            }}
          >
            <Search size={18} color="var(--text-muted)" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, name, or store name..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "12px 0",
                background: "transparent",
              }}
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
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
            onChange={(e) => setTierFilter(e.target.value)}
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
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={selectStyle}
          >
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
            <option value="points">Sort by Total Points</option>
          </select>
        </div>

        <p style={{ color: "var(--text-muted)", marginTop: 18 }}>
          Showing <strong>{filteredRetailers.length}</strong> retailer
          {filteredRetailers.length === 1 ? "" : "s"}
        </p>

        {viewMode === "list" ? (
          <div className="card" style={{ marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
                  <th>Retailer ID</th>
                  <th>Name</th>
                  <th>Store Name</th>
                  <th>Region</th>
                  <th>Tier</th>
                  <th>Total Points</th>
                  <th>Total Sales</th>
                </tr>
              </thead>

              <tbody>
                {filteredRetailers.map((retailer) => (
                  <tr key={retailer.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: "16px 0" }}>
                      <Link to={`/retailers/${retailer.id}`} style={rowLinkStyle}>
                        {retailer.id}
                      </Link>
                    </td>

                    <td>
                      <Link to={`/retailers/${retailer.id}`} style={rowLinkStyle}>
                        {retailer.name}
                      </Link>
                    </td>

                    <td>
                      <Link to={`/retailers/${retailer.id}`} style={rowLinkStyle}>
                        {retailer.store_name}
                      </Link>
                    </td>

                    <td>{retailer.region}</td>

                    <td>
                      <TierBadge tier={retailer.tier} />
                    </td>

                    <td>{retailer.points.toLocaleString()}</td>

                    <td>${retailer.total_sales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 16,
            }}
          >
            {filteredRetailers.map((retailer) => (
              <Link
                key={retailer.id}
                to={`/retailers/${retailer.id}`}
                className="card"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  display: "block",
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 150,
                    background:
                      "linear-gradient(135deg, rgba(122,193,67,0.25), rgba(103,153,200,0.25))",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {retailer.profile_image ? (
                    <img
                      src={retailer.profile_image}
                      alt={retailer.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "var(--bm-blue)",
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 28,
                        fontWeight: 800,
                      }}
                    >
                      {retailer.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-muted)",
                          fontSize: 13,
                        }}
                      >
                        {retailer.id}
                      </p>
                      <h2 style={{ margin: "6px 0 2px" }}>{retailer.name}</h2>
                    </div>

                    <TierBadge tier={retailer.tier} />
                  </div>

                  <p style={{ color: "var(--text-muted)", marginTop: 10 }}>
                    {retailer.store_name} · {retailer.region}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    <MiniMetric
                      label="Points"
                      value={retailer.points.toLocaleString()}
                    />
                    <MiniMetric
                      label="Sales"
                      value={`$${retailer.total_sales.toLocaleString()}`}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 12,
      }}
    >
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 12 }}>
        {label}
      </p>
      <strong>{value}</strong>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "12px",
  background: "white",
  color: "var(--text-main)",
  outline: "none",
};

const rowLinkStyle: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 700,
};