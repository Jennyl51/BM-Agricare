import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  getAdminInvoiceDetail,
  reviewAdminInvoice,
} from "../services/adminInvoicesApi";
import type { AdminInvoiceDetail } from "../services/adminInvoicesApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

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

function getStatusClass(status?: string | null) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved") return "status-approved";
  if (normalized === "rejected" || normalized === "admin_rejected") {
    return "status-rejected";
  }
  if (normalized === "waiting_tce" || normalized === "not_required") {
    return "status-info";
  }

  return "status-pending";
}

function statusLabel(status?: string | null) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const { t } = useAppPreferences();

  const [invoice, setInvoice] = useState<AdminInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const adminStatus = (invoice?.admin_status || "").toLowerCase();
  const tceStatus = (invoice?.tce_status || "").toLowerCase();

  const adminReviewCompleted =
    adminStatus === "approved" || adminStatus === "rejected";

  const canAdminReview = tceStatus === "approved" && adminStatus === "pending";

  const reviewMessage = useMemo(() => {
    if (!invoice) return "";

    if (adminStatus === "approved") {
      return t("adminApprovedMessage");
    }

    if (adminStatus === "rejected") {
      return t("adminRejectedMessage");
    }

    if (tceStatus !== "approved") {
      return t("waitingForTceApproval");
    }

    return t("readyForAdminReview");
  }, [invoice, adminStatus, tceStatus, t]);

  useEffect(() => {
    async function loadInvoice() {
      if (!invoiceId) return;

      setLoading(true);
      setError("");

      try {
        const data = await getAdminInvoiceDetail(invoiceId);
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("unableToLoadInvoice"));
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [invoiceId, t]);

  const handleReview = async (reviewStatus: "approved" | "rejected") => {
    if (!invoiceId) return;

    setError("");
    setSuccessMessage("");

    if (reviewStatus === "rejected" && !rejectionReason.trim()) {
      setError(t("enterRejectionReason"));
      return;
    }

    setReviewing(true);

    try {
      const updatedInvoice = await reviewAdminInvoice({
        invoiceId,
        reviewStatus,
        rejectionReason: rejectionReason.trim(),
      });

      setInvoice(updatedInvoice);
      setSuccessMessage(
        reviewStatus === "approved"
          ? t("invoiceApprovedByAdmin")
          : t("invoiceRejectedByAdmin")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unableToSubmitReview"));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div style={{ marginTop: 22 }}>
          <Link
            to="/dashboard"
            style={{
              color: "var(--text-brand-readable)",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← {t("backToDashboard")}
          </Link>

          <h1 style={{ marginBottom: 8 }}>
            {invoice
              ? `${t("invoiceNumber")} ${
                  invoice.invoice_number || invoice.invoice_id
                }`
              : t("invoiceReview")}
          </h1>

          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
            {t("invoiceReviewSubtitle")}
          </p>
        </div>

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            {t("loadingInvoice")}
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

        {successMessage && (
          <div
            className="card"
            style={{
              marginTop: 24,
              color: "var(--success-text)",
              borderColor: "var(--success-text)",
            }}
          >
            {successMessage}
          </div>
        )}

        {!loading && !invoice && !error && (
          <div className="card" style={{ marginTop: 24 }}>
            {t("invoiceNotFound")}
          </div>
        )}

        {invoice && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.15fr 0.85fr",
                gap: 24,
                marginTop: 24,
                alignItems: "start",
              }}
            >
              <section className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={eyebrowStyle}>{t("invoiceInformation")}</p>
                    <h2 style={{ margin: "6px 0 0" }}>
                      {invoice.retailer_name}
                    </h2>
                    <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                      {invoice.region} · {invoice.tier}
                    </p>
                  </div>

                  <span
                    className={`status-pill ${getStatusClass(invoice.status)}`}
                  >
                    {statusLabel(invoice.status)}
                  </span>
                </div>

                <div style={infoGridStyle}>
                  <InfoRow label={t("invoiceId")} value={invoice.invoice_id} />
                  <InfoRow
                    label={t("invoiceNumber")}
                    value={invoice.invoice_number || "—"}
                  />
                  <InfoRow label={t("retailerId")} value={invoice.retailer_id} />
                  <InfoRow
                    label={t("retailerPhone")}
                    value={invoice.retailer_phone || "—"}
                  />
                  <InfoRow
                    label={t("submitted")}
                    value={formatDate(invoice.created_at)}
                  />
                  <InfoRow
                    label={t("totalAmount")}
                    value={formatVnd(invoice.total_amount)}
                  />
                  <InfoRow
                    label={t("totalPoints")}
                    value={invoice.total_points.toLocaleString()}
                  />
                  <InfoRow
                    label={t("assignedTce")}
                    value={invoice.assigned_tce_id || "—"}
                  />
                </div>
              </section>

              <section className="card">
                <p style={eyebrowStyle}>{t("reviewWorkflow")}</p>
                <h2 style={{ margin: "6px 0 16px" }}>
                  {t("approvalStatus")}
                </h2>

                <div style={{ display: "grid", gap: 12 }}>
                  <ReviewStatusRow
                    title={t("tceReview")}
                    status={invoice.tce_status || "pending"}
                    reviewedBy={invoice.tce_reviewed_by}
                    reviewedAt={invoice.tce_reviewed_at}
                    rejectionReason={invoice.tce_rejection_reason}
                    t={t}
                  />

                  <ReviewStatusRow
                    title={t("adminReview")}
                    status={invoice.admin_status || "pending"}
                    reviewedBy={invoice.admin_reviewed_by}
                    reviewedAt={invoice.admin_reviewed_at}
                    rejectionReason={invoice.admin_rejection_reason}
                    t={t}
                  />
                </div>

                {adminReviewCompleted && (
                  <div
                    style={{
                      marginTop: 18,
                      borderRadius: 16,
                      padding: 16,
                      background:
                        adminStatus === "approved"
                          ? "var(--success-bg)"
                          : "var(--danger-bg)",
                      color:
                        adminStatus === "approved"
                          ? "var(--success-text)"
                          : "var(--danger-text)",
                      border: `1px solid ${
                        adminStatus === "approved"
                          ? "var(--success-text)"
                          : "var(--danger-text)"
                      }`,
                      fontWeight: 800,
                      lineHeight: 1.6,
                    }}
                  >
                    {adminStatus === "approved"
                      ? `${invoice.total_points.toLocaleString()} ${t(
                          "pointsApproved"
                        )}`
                      : t("invoiceDenied")}
                  </div>
                )}

                {!adminReviewCompleted && (
                  <>
                    <div style={{ marginTop: 20 }}>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontWeight: 800 }}>
                          {t("adminRejectionReason")}
                        </span>
                        <textarea
                          value={rejectionReason}
                          onChange={(event) =>
                            setRejectionReason(event.target.value)
                          }
                          placeholder={t("rejectionReasonPlaceholder")}
                          rows={4}
                          style={textareaStyle}
                        />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                      <button
                        className="primary-btn"
                        disabled={!canAdminReview || reviewing}
                        onClick={() => handleReview("approved")}
                      >
                        {reviewing ? "Saving..." : t("approveInvoice")}
                      </button>

                      <button
                        className="danger-btn"
                        disabled={!canAdminReview || reviewing}
                        onClick={() => handleReview("rejected")}
                      >
                        {t("reject")}
                      </button>
                    </div>
                  </>
                )}

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: 16,
                    color:
                      adminStatus === "approved"
                        ? "var(--success-text)"
                        : adminStatus === "rejected"
                        ? "var(--danger-text)"
                        : canAdminReview
                        ? "var(--success-text)"
                        : "var(--text-muted)",
                    lineHeight: 1.6,
                    fontWeight: 800,
                  }}
                >
                  {reviewMessage}
                </p>
              </section>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.95fr 1.05fr",
                gap: 24,
                marginTop: 24,
                alignItems: "start",
              }}
            >
              <section className="card">
                <p style={eyebrowStyle}>{t("uploadedProof")}</p>
                <h2 style={{ margin: "6px 0 16px" }}>
                  {t("invoiceImagePdf")}
                </h2>

                <InvoicePreview photoUrl={invoice.photo_url} t={t} />
              </section>

              <section className="card">
                <p style={eyebrowStyle}>{t("lineItems")}</p>
                <h2 style={{ margin: "6px 0 16px" }}>
                  {t("invoiceItems")}
                </h2>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 720,
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
                        <th style={thStyle}>{t("product")}</th>
                        <th style={thStyle}>{t("quantity")}</th>
                        <th style={thStyle}>{t("price")}</th>
                        <th style={thStyle}>{t("subtotal")}</th>
                        <th style={thStyle}>{t("points")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoice.items.map((item) => (
                        <tr
                          key={item.item_id}
                          style={{
                            borderBottom: "1px solid var(--border-soft)",
                          }}
                        >
                          <td style={tdStyle}>
                            <strong>{item.product_name}</strong>
                            <p
                              style={{
                                margin: "4px 0 0",
                                color: "var(--text-muted)",
                              }}
                            >
                              Product ID: {item.product_id}
                            </p>
                          </td>
                          <td style={tdStyle}>{item.quantity}</td>
                          <td style={tdStyle}>
                            {formatVnd(item.price_at_purchase)}
                          </td>
                          <td style={tdStyle}>{formatVnd(item.subtotal)}</td>
                          <td style={tdStyle}>
                            {Number(item.points).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontWeight: 800 }}>{value}</p>
    </div>
  );
}

function ReviewStatusRow({
  title,
  status,
  reviewedBy,
  reviewedAt,
  rejectionReason,
  t,
}: {
  title: string;
  status: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  t: (key: string) => string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-soft)",
        borderRadius: 16,
        padding: 14,
        background: "var(--bg-soft)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong>{title}</strong>
        <span className={`status-pill ${getStatusClass(status)}`}>
          {statusLabel(status)}
        </span>
      </div>

      <p style={{ margin: "8px 0 0", color: "var(--text-muted)" }}>
        {t("reviewedBy")}: {reviewedBy || "—"}
      </p>

      <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
        {t("reviewedAt")}: {formatDate(reviewedAt)}
      </p>

      {rejectionReason && (
        <p style={{ margin: "8px 0 0", color: "var(--danger-text)" }}>
          Reason: {rejectionReason}
        </p>
      )}
    </div>
  );
}

function InvoicePreview({
  photoUrl,
  t,
}: {
  photoUrl?: string | null;
  t: (key: string) => string;
}) {
  if (!photoUrl) {
    return <div style={previewPlaceholderStyle}>{t("noInvoiceFile")}</div>;
  }

  const isPdf = photoUrl.toLowerCase().endsWith(".pdf");
  const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(photoUrl);

  if (isPdf) {
    return (
      <div>
        <iframe
          src={photoUrl}
          title="Invoice PDF Preview"
          style={{
            width: "100%",
            height: 420,
            border: "1px solid var(--border-soft)",
            borderRadius: 16,
            background: "var(--bg-soft)",
          }}
        />

        <a href={photoUrl} target="_blank" rel="noreferrer" style={openLinkStyle}>
          {t("openPdf")}
        </a>
      </div>
    );
  }

  if (isImage) {
    return (
      <div>
        <img
          src={photoUrl}
          alt="Uploaded invoice"
          style={{
            width: "100%",
            maxHeight: 420,
            objectFit: "contain",
            borderRadius: 16,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-soft)",
          }}
        />

        <a href={photoUrl} target="_blank" rel="noreferrer" style={openLinkStyle}>
          {t("openImage")}
        </a>
      </div>
    );
  }

  return (
    <div style={previewPlaceholderStyle}>
      <p style={{ marginTop: 0 }}>Invoice file:</p>
      <a href={photoUrl} target="_blank" rel="noreferrer" style={openLinkStyle}>
        {photoUrl}
      </a>
    </div>
  );
}

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontWeight: 800,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: 0.7,
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginTop: 20,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: 12,
  background: "var(--bg-card)",
  color: "var(--text-main)",
  resize: "vertical",
};

const thStyle: CSSProperties = {
  padding: "0 10px 12px 0",
  fontSize: "0.82rem",
};

const tdStyle: CSSProperties = {
  padding: "14px 10px 14px 0",
  verticalAlign: "top",
};

const previewPlaceholderStyle: CSSProperties = {
  height: 420,
  borderRadius: 16,
  background: "var(--bg-soft)",
  border: "1px dashed var(--border-soft)",
  display: "grid",
  placeItems: "center",
  color: "var(--text-muted)",
  textAlign: "center",
  padding: 24,
};

const openLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  color: "var(--text-brand-readable)",
  fontWeight: 800,
  textDecoration: "none",
};