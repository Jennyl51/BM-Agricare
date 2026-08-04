import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  listAdminInvoices,
  type AdminInvoiceListItem,
} from "../services/adminInvoicesApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type SortDirection = "asc" | "desc";
type SortField =
  | "invoice"
  | "retailer"
  | "region"
  | "tce"
  | "admin"
  | "points"
  | "total"
  | "submitted";

const PAGE_SIZE = 10;

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

function normalizeStatus(status?: string | null) {
  return (status || "pending").toLowerCase();
}

function getAdminReviewStatus(invoice: AdminInvoiceListItem) {
  return normalizeStatus(invoice.admin_status);
}

function isOverallApproved(invoice: AdminInvoiceListItem) {
  return (
    normalizeStatus(invoice.tce_status) === "approved" &&
    normalizeStatus(invoice.admin_status) === "approved"
  );
}

function isAdminRejected(invoice: AdminInvoiceListItem) {
  return normalizeStatus(invoice.admin_status) === "rejected";
}

function isAdminPendingReview(invoice: AdminInvoiceListItem) {
  return (
    normalizeStatus(invoice.tce_status) === "approved" &&
    normalizeStatus(invoice.admin_status) === "pending"
  );
}

function getStatusClass(status?: string | null) {
  const normalized = normalizeStatus(status);

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

function getInvoiceNumber(invoice: AdminInvoiceListItem) {
  return invoice.invoice_number || `INV-${invoice.invoice_id.slice(0, 8)}`;
}

function getSortValue(invoice: AdminInvoiceListItem, field: SortField) {
  switch (field) {
    case "invoice":
      return getInvoiceNumber(invoice).toLowerCase();
    case "retailer":
      return invoice.retailer_name.toLowerCase();
    case "region":
      return invoice.region.toLowerCase();
    case "tce":
      return normalizeStatus(invoice.tce_status);
    case "admin":
      return normalizeStatus(invoice.admin_status);
    case "points":
      return Number(invoice.points || 0);
    case "total":
      return Number(invoice.total_sales || 0);
    case "submitted":
      return new Date(invoice.created_at).getTime() || 0;
    default:
      return "";
  }
}

export default function Invoices() {
  const { t } = useAppPreferences();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<AdminInvoiceListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("submitted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvoices() {
    setLoading(true);
    setError("");

    try {
      const data = await listAdminInvoices({
        status: "all",
        limit: 500,
      });
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unableToLoadInvoices"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortField, sortDirection]);

  const adminVisibleInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const tceStatus = normalizeStatus(invoice.tce_status);
      return tceStatus === "approved" || tceStatus === "rejected";
    });
  }, [invoices]);

  const stats = useMemo(() => {
    const approved = adminVisibleInvoices.filter(isOverallApproved).length;
    const rejected = adminVisibleInvoices.filter(isAdminRejected).length;
    const pending = adminVisibleInvoices.filter(isAdminPendingReview).length;

    return {
      totalSubmissions: invoices.length,
      adminVisible: adminVisibleInvoices.length,
      processed: approved + rejected,
      pending,
      approved,
      rejected,
    };
  }, [invoices, adminVisibleInvoices]);

  const filteredInvoices = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    let result = adminVisibleInvoices;

    if (statusFilter !== "all") {
      result = result.filter((invoice) => {
        if (statusFilter === "pending") {
          return isAdminPendingReview(invoice);
        }

        if (statusFilter === "approved") {
          return isOverallApproved(invoice);
        }

        if (statusFilter === "rejected") {
          return isAdminRejected(invoice);
        }

        return true;
      });
    }

    if (cleanSearch) {
      result = result.filter((invoice) => {
        return (
          invoice.invoice_id.toLowerCase().includes(cleanSearch) ||
          (invoice.invoice_number || "").toLowerCase().includes(cleanSearch) ||
          invoice.retailer_name.toLowerCase().includes(cleanSearch) ||
          invoice.region.toLowerCase().includes(cleanSearch) ||
          invoice.tier.toLowerCase().includes(cleanSearch) ||
          formatStatus(invoice.admin_status).toLowerCase().includes(cleanSearch)
        );
      });
    }

    return [...result].sort((a, b) => {
      const first = getSortValue(a, sortField);
      const second = getSortValue(b, sortField);

      if (typeof first === "number" && typeof second === "number") {
        return sortDirection === "asc" ? first - second : second - first;
      }

      const comparison = String(first).localeCompare(String(second));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [adminVisibleInvoices, statusFilter, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "submitted" ? "desc" : "asc");
  }

  function sortIcon(field: SortField) {
    if (field !== sortField) return "↕";
    return sortDirection === "asc" ? "▲" : "▼";
  }

  function handleCardClick(nextFilter: StatusFilter) {
    setStatusFilter(nextFilter);
  }

  return (
    <AdminLayout>
      <div className="page">
        <style>
          {`
            @media (max-width: 900px) {
              .invoice-total-column {
                display: none;
              }
            }

            .invoice-row-clickable:hover {
              background: var(--bg-soft);
            }
          `}
        </style>

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
            <h1>{t("invoices")}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              {t("invoicePageSubtitle")}
            </p>
          </div>

          <button className="secondary-btn" onClick={loadInvoices}>
            {t("refreshData")}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
         <FilterCard
            title={t("totalInvoices")}
            value={stats.adminVisible}
            subtitle={`${t("totalInvoiceSubmissions")}: ${stats.totalSubmissions}`}
            isActive={statusFilter === "all"}
            onClick={() => handleCardClick("all")}
          />

          <FilterCard
            title={t("pending")}
            value={stats.pending}
            subtitle={t("needReview")}
            isActive={statusFilter === "pending"}
            onClick={() => handleCardClick("pending")}
          />

          <FilterCard
            title={t("approved")}
            value={stats.approved}
            subtitle={t("completedApprovals")}
            isActive={statusFilter === "approved"}
            onClick={() => handleCardClick("approved")}
          />

          <FilterCard
            title={t("rejected")}
            value={stats.rejected}
            subtitle={t("denied")}
            isActive={statusFilter === "rejected"}
            onClick={() => handleCardClick("rejected")}
          />
        </div>

        <div
          className="card"
          style={{
            ...invoiceSubmissionsCardStyle,
            marginTop: 24,
          }}
        >
          <div style={invoiceBoxTopAccentStyle} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              marginBottom: 18,
              paddingTop: 8,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>{t("invoiceSubmissions")}</h2>
              <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                {t("showing")} {filteredInvoices.length}{" "}
                {filteredInvoices.length === 1 ? t("invoice") : t("invoices")}.
              </p>
            </div>

            <div
              className="no-print"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchInvoices")}
                style={inputStyle}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                style={selectStyle}
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="approved">{t("approved")}</option>
                <option value="rejected">{t("rejected")}</option>
              </select>
            </div>
          </div>

          {loading && <div style={emptyStateStyle}>{t("loadingInvoices")}</div>}

          {error && <div style={errorStateStyle}>{error}</div>}

          {!loading && !error && filteredInvoices.length === 0 && (
            <div style={emptyStateStyle}>{t("noInvoicesFound")}</div>
          )}

          {!loading && !error && filteredInvoices.length > 0 && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 880,
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
                      <SortableHeader
                        label={t("invoice")}
                        field="invoice"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("retailer")}
                        field="retailer"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("region")}
                        field="region"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("tce")}
                        field="tce"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("admin")}
                        field="admin"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("pointsEarned")}
                        field="points"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("totalSales")}
                        field="total"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                        className="invoice-total-column"
                      />
                      <SortableHeader
                        label={t("submitted")}
                        field="submitted"
                        activeField={sortField}
                        sortIcon={sortIcon}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedInvoices.map((invoice) => {
                      const adminReviewStatus = getAdminReviewStatus(invoice);

                      return (
                        <tr
                          key={invoice.invoice_id}
                          className="invoice-row-clickable"
                          tabIndex={0}
                          onClick={() =>
                            navigate(`/invoices/${invoice.invoice_id}`)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              navigate(`/invoices/${invoice.invoice_id}`);
                            }
                          }}
                          style={{
                            borderBottom: "1px solid var(--border-soft)",
                            cursor: "pointer",
                            position: "relative",
                          }}
                        >
                          <td style={firstTdStyle(adminReviewStatus)}>
                            <strong>{getInvoiceNumber(invoice)}</strong>
                            <p style={mutedSmallTextStyle}>
                              {invoice.item_count}{" "}
                              {invoice.item_count === 1 ? t("item") : t("items")}
                            </p>
                          </td>

                          <td style={tdStyle}>
                            <strong>{invoice.retailer_name}</strong>
                            <p style={mutedSmallTextStyle}>{invoice.tier}</p>
                          </td>

                          <td style={tdStyle}>{invoice.region}</td>

                          <td style={tdStyle}>
                            <span
                              className={`status-pill ${getStatusClass(
                                invoice.tce_status || "pending"
                              )}`}
                            >
                              {formatStatus(invoice.tce_status || "pending")}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <span
                              className={`status-pill ${getStatusClass(
                                invoice.admin_status || "pending"
                              )}`}
                            >
                              {formatStatus(invoice.admin_status || "pending")}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <strong>
                              {Number(invoice.points || 0).toLocaleString()}
                            </strong>
                          </td>

                          <td className="invoice-total-column" style={tdStyle}>
                            <strong>{formatVnd(invoice.total_sales)}</strong>
                          </td>

                          <td style={tdStyle}>
                            {formatDate(invoice.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={paginationStyle}>
                <button
                  className="secondary-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  ← {t("previous")}
                </button>

                <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>
                  {t("page")} {currentPage} {t("of")} {totalPages}
                </span>

                <button
                  className="secondary-btn"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  {t("next")} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function FilterCard({
  title,
  value,
  subtitle,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  subtitle: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...filterCardStyle,
        borderColor: isActive ? "var(--text-brand-readable)" : "var(--border-soft)",
        boxShadow: isActive
          ? "0 8px 18px rgba(6, 53, 122, 0.12)"
          : "0 4px 12px rgba(16, 24, 40, 0.05)",
        transform: isActive ? "translateY(-1px)" : "none",
      }}
    >
      <p style={cardTitleStyle}>{title}</p>
      <strong style={cardValueStyle}>{value.toLocaleString()}</strong>
      <p style={cardSubtitleStyle}>{subtitle}</p>
    </button>
  );
}

function SortableHeader({
  label,
  field,
  activeField,
  sortIcon,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  sortIcon: (field: SortField) => string;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = field === activeField;

  return (
    <th style={thStyle} className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        style={{
          border: 0,
          background: "transparent",
          color: isActive ? "var(--text-brand-readable)" : "var(--text-muted)",
          padding: 0,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {label}
        <span style={{ fontSize: "0.72rem" }}>{sortIcon(field)}</span>
      </button>
    </th>
  );
}

function firstTdStyle(adminStatus: string): CSSProperties {
  const normalized = normalizeStatus(adminStatus);

  const color =
    normalized === "approved"
      ? "rgba(122, 193, 67, 0.45)"
      : normalized === "rejected"
      ? "rgba(227, 27, 35, 0.38)"
      : "transparent";

  return {
    ...tdStyle,
    borderLeft: `6px solid ${color}`,
    paddingLeft: 12,
  };
}

const invoiceSubmissionsCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
};

const invoiceBoxTopAccentStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 6,
  background: "rgba(103, 153, 200, 0.55)",
  borderRadius: "18px 18px 0 0",
};

const filterCardStyle: CSSProperties = {
  textAlign: "left",
  border: "1px solid var(--border-soft)",
  borderRadius: 18,
  padding: 18,
  background: "var(--bg-card)",
  color: "var(--text-main)",
  cursor: "pointer",
  transition: "box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontWeight: 800,
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

const cardValueStyle: CSSProperties = {
  display: "block",
  marginTop: 10,
  fontSize: "2rem",
  lineHeight: 1,
};

const cardSubtitleStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "var(--text-muted)",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  minWidth: 240,
  height: 42,
  borderRadius: 12,
  border: "1px solid var(--border-soft)",
  padding: "0 12px",
  background: "var(--bg-card)",
  color: "var(--text-main)",
};

const selectStyle: CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "1px solid var(--border-soft)",
  padding: "0 12px",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  fontWeight: 700,
};

const thStyle: CSSProperties = {
  padding: "0 12px 12px 0",
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "14px 12px 14px 0",
  verticalAlign: "top",
};

const mutedSmallTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "var(--text-muted)",
  fontSize: "0.82rem",
};

const emptyStateStyle: CSSProperties = {
  padding: "22px 0",
  color: "var(--text-muted)",
  fontWeight: 700,
};

const errorStateStyle: CSSProperties = {
  padding: 16,
  borderRadius: 14,
  border: "1px solid var(--danger-text)",
  color: "var(--danger-text)",
  background: "var(--danger-bg)",
  fontWeight: 800,
};

const paginationStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
  marginTop: 20,
};