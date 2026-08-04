import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Eye,
  EyeOff,
  PackageCheck,
  Pin,
  PinOff,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  addRewardActivityNote,
  createRewardPinSchedule,
  deleteAdminReward,
  getAdminRewardDetail,
  setAdminRewardPinned,
  setAdminRewardVisible,
  updateAdminReward,
  uploadRewardImage,
  type AdminReward,
  type AdminRewardPayload,
  type RewardActivityLog,
  type RewardDetailResponse,
  type RewardPinSchedule,
  type RewardRedemptionLog,
} from "../services/adminRewardsApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

type RewardFormState = {
  name: string;
  related_product: string;
  description: string;
  points_required: string;
  min_tier: string;
  stock_quantity: string;
  image_url: string;
  is_pinned: boolean;
  is_seasonal: boolean;
  is_visible: boolean;
  status: string;
  admin_notes: string;
};

function fallbackT(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function rewardDisplayId(reward: AdminReward) {
  if (reward.rwd_id) {
    return `RWD-${String(reward.rwd_id).padStart(3, "0")}`;
  }

  return `RWD-${reward.reward_id.slice(0, 8)}`;
}

function createFormFromReward(reward: AdminReward): RewardFormState {
  return {
    name: reward.name || "",
    related_product: reward.related_product || reward.name || "",
    description: reward.description || "",
    points_required: String(reward.points_required ?? 150),
    min_tier: reward.min_tier || "Bronze",
    stock_quantity: String(reward.stock_quantity ?? 100),
    image_url: reward.image_url || "",
    is_pinned: reward.is_pinned ?? false,
    is_seasonal: reward.is_seasonal ?? false,
    is_visible: reward.is_visible ?? true,
    status: reward.status || "Active",
    admin_notes: reward.admin_notes || "",
  };
}

function createPayloadFromForm(form: RewardFormState): AdminRewardPayload {
  return {
    name: form.name.trim(),
    related_product: form.related_product.trim() || form.name.trim(),
    description: form.description.trim(),
    points_required: Number(form.points_required || 150),
    min_tier: form.min_tier,
    stock_quantity: Number(form.stock_quantity || 0),
    image_url: form.image_url.trim(),
    is_pinned: form.is_pinned,
    is_seasonal: form.is_seasonal,
    is_visible: form.is_visible,
    status: form.is_visible ? form.status : "Hidden",
    admin_notes: form.admin_notes.trim(),
  };
}

export default function RewardDetail() {
  const { rewardId } = useParams();
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [data, setData] = useState<RewardDetailResponse | null>(null);
  const [form, setForm] = useState<RewardFormState | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminReward | null>(
    null
  );

  const [noteText, setNoteText] = useState("");
  const [scheduleAction, setScheduleAction] = useState<"pin" | "unpin">("pin");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadReward() {
    if (!rewardId) return;

    setLoading(true);
    setError("");

    try {
      const result = await getAdminRewardDetail(rewardId);
      setData(result);
      setForm(createFormFromReward(result.reward));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reward.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardId]);

  const reward = data?.reward;

  function updateForm<K extends keyof RewardFormState>(
    key: K,
    value: RewardFormState[K]
  ) {
    setForm((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  }

  async function handleUploadImage(file: File) {
    setUploadingImage(true);
    setError("");

    try {
      const uploaded = await uploadRewardImage(file);
      updateForm("image_url", uploaded.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveReward() {
    if (!reward || !form) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = createPayloadFromForm(form);

      if (!payload.name) {
        throw new Error("Reward name is required.");
      }

      if (!payload.image_url) {
        throw new Error("Reward image is required.");
      }

      await updateAdminReward(reward.reward_id, {
        ...payload,
        comment: "Reward detail information updated.",
      });

      setSuccessMessage("Reward updated successfully.");
      setIsEditing(false);
      await loadReward();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reward.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin() {
    if (!reward) return;

    setError("");
    setSuccessMessage("");

    try {
      await setAdminRewardPinned(reward.reward_id, !reward.is_pinned);
      setSuccessMessage(reward.is_pinned ? "Reward unpinned." : "Reward pinned.");
      await loadReward();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update pinned status."
      );
    }
  }

  async function handleToggleVisible() {
    if (!reward) return;

    setError("");
    setSuccessMessage("");

    try {
      await setAdminRewardVisible(reward.reward_id, !reward.is_visible);
      setSuccessMessage(
        reward.is_visible
          ? "Reward hidden from retailer interface."
          : "Reward restored to retailer interface."
      );
      await loadReward();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update visibility."
      );
    }
  }

  async function handleSaveComment() {
    if (!reward) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await addRewardActivityNote(reward.reward_id, noteText);
      setNoteText("");
      setSuccessMessage("Comment saved.");
      await loadReward();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save comment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSchedule(event: FormEvent) {
    event.preventDefault();

    if (!reward) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!scheduledAt) {
        throw new Error("Scheduled time is required.");
      }

      await createRewardPinSchedule(reward.reward_id, {
        action: scheduleAction,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes: scheduleNotes,
      });

      setScheduledAt("");
      setScheduleNotes("");
      setSuccessMessage("Pin schedule created.");
      await loadReward();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteReward() {
    if (!deleteCandidate) return;

    setDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteAdminReward(deleteCandidate.reward_id);
      navigate("/rewards");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove reward. Hide it instead if it has redemption history."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="page">
          <div className="card">Loading reward from Postgres...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!reward || !data || !form) {
    return (
      <AdminLayout>
        <div className="page">
          <Link to="/rewards" style={backLinkStyle}>
            <ArrowLeft size={18} />
            Back to Rewards
          </Link>

          <div className="card" style={{ marginTop: 24 }}>
            <h1>Reward not found</h1>
            <p style={{ color: "var(--text-muted)" }}>
              This reward does not exist in the database.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const imageSrc = getImageSrc(reward.image_url);

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <Link to="/rewards" style={backLinkStyle}>
          <ArrowLeft size={18} />
          Back to Rewards
        </Link>

        {error && <div style={errorBoxStyle}>{error}</div>}
        {successMessage && <div style={successBoxStyle}>{successMessage}</div>}

        <div style={heroGridStyle}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={imagePanelStyle}>
              {imageSrc ? (
                <img src={imageSrc} alt={reward.name} style={rewardImageStyle} />
              ) : (
                <div style={imageFallbackStyle}>Reward</div>
              )}
            </div>
          </div>

          <div className="card">
            <div style={detailHeaderRowStyle}>
              <div>
                <p style={mutedSmallTextStyle}>{rewardDisplayId(reward)}</p>
                <h1 style={{ margin: "8px 0" }}>{reward.name}</h1>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {reward.is_pinned && (
                    <Badge label={fallbackT(t, "pinned", "Pinned")} type="blue" />
                  )}
                  {reward.is_seasonal && (
                    <Badge
                      label={fallbackT(t, "seasonal", "Seasonal")}
                      type="yellow"
                    />
                  )}
                  {reward.is_visible ? (
                    <Badge label={fallbackT(t, "visible", "Visible")} type="green" />
                  ) : (
                    <Badge label={fallbackT(t, "hidden", "Hidden")} type="gray" />
                  )}
                  <Badge label={reward.status} type="gray" />
                </div>
              </div>

              <button className="secondary-btn" onClick={() => setIsEditing(true)}>
                <Edit size={17} />
                {fallbackT(t, "edit", "Edit")}
              </button>
            </div>

            <p style={descriptionStyle}>{reward.description}</p>

            <div style={statsGridStyle}>
              <MiniMetric
                label={fallbackT(t, "pointsRequired", "Points Required")}
                value={`${Number(reward.points_required || 0).toLocaleString()} pts`}
              />
              <MiniMetric
                label={fallbackT(t, "minimumTier", "Minimum Tier")}
                value={reward.min_tier}
              />
              <MiniMetric
                label={fallbackT(t, "stockQuantity", "Stock Quantity")}
                value={Number(reward.stock_quantity || 0).toLocaleString()}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button className="secondary-btn" onClick={handleTogglePin}>
                {reward.is_pinned ? <PinOff size={17} /> : <Pin size={17} />}
                {reward.is_pinned
                  ? fallbackT(t, "unpin", "Unpin")
                  : fallbackT(t, "pin", "Pin")}
              </button>

              <button className="secondary-btn" onClick={handleToggleVisible}>
                {reward.is_visible ? <EyeOff size={17} /> : <Eye size={17} />}
                {reward.is_visible
                  ? fallbackT(t, "hide", "Hide")
                  : fallbackT(t, "show", "Show")}
              </button>

              <button
                className="secondary-btn"
                onClick={() => setDeleteCandidate(reward)}
                style={{ color: "var(--danger-text)" }}
              >
                <Trash2 size={17} />
                {fallbackT(t, "remove", "Remove")}
              </button>
            </div>
          </div>
        </div>

        <div style={statsGridLargeStyle}>
          <MiniMetric
            label={fallbackT(t, "recentRewardRedemptions", "Recent Reward Redemptions")}
            value={Number(data.stats.redemption_count || 0).toLocaleString()}
          />
          <MiniMetric
            label={fallbackT(t, "quantityRedeemed", "Quantity Redeemed")}
            value={Number(data.stats.quantity_redeemed || 0).toLocaleString()}
          />
          <MiniMetric
            label={fallbackT(t, "pointsDeducted", "Points Deducted")}
            value={Number(data.stats.points_deducted || 0).toLocaleString()}
          />
          <MiniMetric
            label={fallbackT(t, "uniqueRetailers", "Unique Retailers")}
            value={Number(data.stats.unique_retailers || 0).toLocaleString()}
          />
        </div>

        <div style={twoColumnGridStyle}>
          <section className="card">
            <h2>{fallbackT(t, "rewardActivityLog", "Reward Activity Log")}</h2>

            {data.activityLog.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No activity yet.</p>
            ) : (
              data.activityLog.map((item) => (
                <ActivityLogItem key={item.log_id} item={item} />
              ))
            )}
          </section>

          <section className="card">
            <h2>{fallbackT(t, "schedulePinning", "Schedule Pinning")}</h2>

            <form onSubmit={handleCreateSchedule} style={{ display: "grid", gap: 14 }}>
              <select
                value={scheduleAction}
                onChange={(event) =>
                  setScheduleAction(event.target.value as "pin" | "unpin")
                }
                style={inputStyle}
              >
                <option value="pin">{fallbackT(t, "schedulePin", "Schedule Pin")}</option>
                <option value="unpin">
                  {fallbackT(t, "scheduleUnpin", "Schedule Unpin")}
                </option>
              </select>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                style={inputStyle}
              />

              <textarea
                value={scheduleNotes}
                placeholder="Optional schedule notes..."
                onChange={(event) => setScheduleNotes(event.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              />

              <button className="primary-btn" type="submit" disabled={saving}>
                {fallbackT(t, "schedulePinning", "Schedule Pinning")}
              </button>
            </form>

            <h3 style={{ marginTop: 24 }}>Scheduled Actions</h3>
            {data.pinSchedules.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                No pin schedules created.
              </p>
            ) : (
              data.pinSchedules.map((schedule) => (
                <ScheduleItem key={schedule.schedule_id} schedule={schedule} />
              ))
            )}
          </section>
        </div>

        <section className="card" style={{ marginTop: 24 }}>
          <h2>{fallbackT(t, "recentRewardRedemptions", "Recent Reward Redemptions")}</h2>

          {data.recentRedemptions.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No redemption history for this reward yet.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeadRowStyle}>
                    <th style={thStyle}>Redemption</th>
                    <th style={thStyle}>Retailer</th>
                    <th style={thStyle}>{fallbackT(t, "quantityRedeemed", "Quantity Redeemed")}</th>
                    <th style={thStyle}>{fallbackT(t, "pointsDeducted", "Points Deducted")}</th>
                    <th style={thStyle}>{fallbackT(t, "redemptionStatus", "Redemption Status")}</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {data.recentRedemptions.map((redemption) => (
                    <RedemptionRow
                      key={redemption.redemption_id}
                      redemption={redemption}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <h2>{fallbackT(t, "adminNotes", "Admin Notes")}</h2>

          {reward.admin_notes && (
            <div style={noteBoxStyle}>
              <strong>Saved notes</strong>
              <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                {reward.admin_notes}
              </p>
            </div>
          )}

          <textarea
            value={noteText}
            placeholder={fallbackT(
              t,
              "addInternalComment",
              "Add internal comment"
            )}
            onChange={(event) => setNoteText(event.target.value)}
            style={{
              marginTop: 12,
              width: "100%",
              minHeight: 120,
              borderRadius: 16,
              border: "1px solid var(--border-soft)",
              padding: 14,
              resize: "vertical",
              outline: "none",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
          />

          <button
            className="primary-btn"
            style={{ marginTop: 12 }}
            onClick={handleSaveComment}
            disabled={saving}
          >
            {fallbackT(t, "saveComment", "Save Comment")}
          </button>
        </section>

        {isEditing && (
          <RewardEditDrawer
            form={form}
            saving={saving}
            uploadingImage={uploadingImage}
            t={t}
            onUpdate={updateForm}
            onUploadImage={handleUploadImage}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveReward}
          />
        )}

        {deleteCandidate && (
          <ConfirmRemoveRewardModal
            reward={deleteCandidate}
            deleting={deleting}
            t={t}
            onCancel={() => setDeleteCandidate(null)}
            onConfirm={confirmDeleteReward}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function RewardEditDrawer({
  form,
  saving,
  uploadingImage,
  t,
  onUpdate,
  onUploadImage,
  onClose,
  onSave,
}: {
  form: RewardFormState;
  saving: boolean;
  uploadingImage: boolean;
  t: (key: string) => string;
  onUpdate: <K extends keyof RewardFormState>(
    key: K,
    value: RewardFormState[K]
  ) => void;
  onUploadImage: (file: File) => Promise<void>;
  onClose: () => void;
  onSave: () => void;
}) {
  const previewSrc = getImageSrc(form.image_url);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <div style={drawerOverlayStyle}>
      <form style={drawerStyle} onSubmit={handleSubmit}>
        <div style={drawerHeaderStyle}>
          <div>
            <p style={mutedSmallTextStyle}>
              {fallbackT(t, "editReward", "Edit Reward")}
            </p>
            <h2 style={{ margin: "4px 0 0" }}>{form.name}</h2>
          </div>

          <button type="button" className="secondary-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={drawerBodyStyle}>
          <label style={previewBoxStyle}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                await onUploadImage(file);
                event.target.value = "";
              }}
            />

            {previewSrc ? (
              <img src={previewSrc} alt="Reward preview" style={previewImageStyle} />
            ) : (
              <span style={uploadPromptStyle}>
                <Upload size={18} />
                {uploadingImage
                  ? "Uploading image..."
                  : fallbackT(t, "uploadRewardImage", "Upload Reward Image")}
              </span>
            )}
          </label>

          <FormField label="Reward Name" required>
            <input
              value={form.name}
              onChange={(event) => onUpdate("name", event.target.value)}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Related Product" optional>
            <input
              value={form.related_product}
              onChange={(event) =>
                onUpdate("related_product", event.target.value)
              }
              style={inputStyle}
            />
          </FormField>

          <div style={twoColumnStyle}>
            <FormField
              label={fallbackT(t, "pointsRequired", "Points Required")}
              required
            >
              <input
                type="number"
                value={form.points_required}
                onChange={(event) =>
                  onUpdate("points_required", event.target.value)
                }
                style={inputStyle}
              />
            </FormField>

            <FormField
              label={fallbackT(t, "minimumTier", "Minimum Tier")}
              required
            >
              <select
                value={form.min_tier}
                onChange={(event) => onUpdate("min_tier", event.target.value)}
                style={inputStyle}
              >
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Diamond">Diamond</option>
              </select>
            </FormField>
          </div>

          <div style={twoColumnStyle}>
            <FormField
              label={fallbackT(t, "stockQuantity", "Stock Quantity")}
              optional
            >
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(event) =>
                  onUpdate("stock_quantity", event.target.value)
                }
                style={inputStyle}
              />
            </FormField>

            <FormField label="Status" optional>
              <select
                value={form.status}
                onChange={(event) => onUpdate("status", event.target.value)}
                style={inputStyle}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Hidden">Hidden</option>
              </select>
            </FormField>
          </div>

          <FormField label="Image URL" required>
            <input
              value={form.image_url}
              onChange={(event) => onUpdate("image_url", event.target.value)}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={form.description}
              onChange={(event) => onUpdate("description", event.target.value)}
              style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
            />
          </FormField>

          <FormField label={fallbackT(t, "adminNotes", "Admin Notes")} optional>
            <textarea
              value={form.admin_notes}
              onChange={(event) => onUpdate("admin_notes", event.target.value)}
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            />
          </FormField>

          <div style={checkboxGridStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(event) => onUpdate("is_pinned", event.target.checked)}
              />
              {fallbackT(t, "pinned", "Pinned")}
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.is_seasonal}
                onChange={(event) =>
                  onUpdate("is_seasonal", event.target.checked)
                }
              />
              {fallbackT(t, "seasonal", "Seasonal")}
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  onUpdate("is_visible", event.target.checked)
                }
              />
              {fallbackT(t, "visibleToRetailers", "Visible to retailers")}
            </label>
          </div>
        </div>

        <div style={drawerFooterStyle}>
          <button type="button" className="secondary-btn" onClick={onClose}>
            {fallbackT(t, "cancel", "Cancel")}
          </button>

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : fallbackT(t, "saveReward", "Save Reward")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ActivityLogItem({ item }: { item: RewardActivityLog }) {
  return (
    <div style={activityItemStyle}>
      <div style={activityIconStyle}>
        <PackageCheck size={18} />
      </div>

      <div>
        <strong>{item.action.replaceAll("_", " ")}</strong>
        <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
          {item.comment || "No comment."}
        </p>
        <p style={activityMetaStyle}>
          <Calendar size={14} />
          {formatDate(item.created_at)}
          {item.admin_email ? ` · ${item.admin_email}` : ""}
        </p>
      </div>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: RewardPinSchedule }) {
  return (
    <div style={scheduleItemStyle}>
      <div>
        <strong>{schedule.action === "pin" ? "Pin reward" : "Unpin reward"}</strong>
        <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
          {schedule.notes || "No notes."}
        </p>
      </div>

      <span style={scheduleBadgeStyle}>
        <Clock size={13} />
        {formatDate(schedule.scheduled_at)}
      </span>
    </div>
  );
}

function RedemptionRow({ redemption }: { redemption: RewardRedemptionLog }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
      <td style={tdStyle}>{redemption.redemption_id.slice(0, 8)}</td>
      <td style={tdStyle}>{redemption.retailer_user_id.slice(0, 8)}</td>
      <td style={tdStyle}>{Number(redemption.quantity || 0).toLocaleString()}</td>
      <td style={tdStyle}>
        {Number(redemption.points_deducted || 0).toLocaleString()} pts
      </td>
      <td style={tdStyle}>{redemption.status}</td>
      <td style={tdStyle}>{formatDate(redemption.created_at)}</td>
    </tr>
  );
}

function ConfirmRemoveRewardModal({
  reward,
  deleting,
  t,
  onCancel,
  onConfirm,
}: {
  reward: AdminReward;
  deleting: boolean;
  t: (key: string) => string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div style={modalOverlayStyle}>
      <div style={confirmModalStyle}>
        <div style={confirmIconStyle}>
          <Trash2 size={24} />
        </div>

        <h2 style={{ margin: "16px 0 8px" }}>
          {fallbackT(t, "removeReward", "Remove Reward")}
        </h2>

        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginTop: 0 }}>
          {fallbackT(
            t,
            "removeRewardWarning",
            "This will permanently remove this reward from the database. If it already has redemption history, hide it instead."
          )}
        </p>

        <div style={confirmProductBoxStyle}>
          <strong>{reward.name}</strong>
          <span style={{ color: "var(--text-muted)" }}>
            {rewardDisplayId(reward)} ·{" "}
            {Number(reward.points_required || 0).toLocaleString()} pts
          </span>
        </div>

        <div style={confirmActionsStyle}>
          <button className="secondary-btn" onClick={onCancel} disabled={deleting}>
            {fallbackT(t, "cancel", "Cancel")}
          </button>

          <button
            className="primary-btn"
            onClick={onConfirm}
            disabled={deleting}
            style={{
              background: "var(--danger-text)",
              borderColor: "var(--danger-text)",
            }}
          >
            {deleting ? "Removing..." : fallbackT(t, "remove", "Remove")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={miniMetricStyle}>
      <p style={mutedSmallTextStyle}>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({
  label,
  type,
}: {
  label: string;
  type: "blue" | "yellow" | "gray" | "green";
}) {
  const styles = {
    blue: {
      background: "rgba(6, 53, 122, 0.9)",
      color: "white",
    },
    yellow: {
      background: "rgba(251, 176, 52, 0.95)",
      color: "#3b2500",
    },
    gray: {
      background: "rgba(128, 127, 131, 0.9)",
      color: "white",
    },
    green: {
      background: "rgba(122, 193, 67, 0.95)",
      color: "white",
    },
  };

  return (
    <span
      style={{
        ...styles[type],
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}

function FormField({
  label,
  children,
  required = false,
  optional = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
        {label}
        {required && <span style={{ color: "var(--danger-text)" }}> *</span>}
        {!required && optional && (
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {" "}
            (optional)
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "var(--text-brand-readable)",
  fontWeight: 800,
  textDecoration: "none",
  marginTop: 22,
};

const heroGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.1fr",
  gap: 24,
  marginTop: 24,
};

const imagePanelStyle: CSSProperties = {
  height: 360,
  background:
    "linear-gradient(135deg, rgba(122,193,67,0.10), rgba(103,153,200,0.16))",
  display: "grid",
  placeItems: "center",
};

const rewardImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: 26,
};

const imageFallbackStyle: CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  background: "var(--bm-blue)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const detailHeaderRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
};

const descriptionStyle: CSSProperties = {
  color: "var(--text-muted)",
  lineHeight: 1.7,
  marginTop: 22,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 14,
  marginTop: 22,
};

const statsGridLargeStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
  marginTop: 24,
};

const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
  marginTop: 24,
};

const activityItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "36px 1fr",
  gap: 12,
  borderTop: "1px solid var(--border-soft)",
  padding: "16px 0",
};

const activityIconStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "rgba(103, 153, 200, 0.16)",
  color: "var(--bm-blue)",
  display: "grid",
  placeItems: "center",
};

const activityMetaStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const scheduleItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  borderTop: "1px solid var(--border-soft)",
  padding: "14px 0",
};

const scheduleBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "var(--text-brand-readable)",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 780,
};

const tableHeadRowStyle: CSSProperties = {
  textAlign: "left",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border-soft)",
};

const thStyle: CSSProperties = {
  padding: "0 12px 12px 0",
  fontSize: "0.82rem",
};

const tdStyle: CSSProperties = {
  padding: "14px 12px 14px 0",
  verticalAlign: "top",
};

const noteBoxStyle: CSSProperties = {
  border: "1px solid var(--border-soft)",
  borderRadius: 16,
  padding: 14,
  background: "var(--bg-soft)",
};

const drawerOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  zIndex: 100,
  display: "flex",
  justifyContent: "flex-end",
};

const drawerStyle: CSSProperties = {
  width: "min(720px, 100%)",
  height: "100%",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  boxShadow: "-20px 0 50px rgba(15, 23, 42, 0.18)",
  display: "flex",
  flexDirection: "column",
};

const drawerHeaderStyle: CSSProperties = {
  padding: 22,
  borderBottom: "1px solid var(--border-soft)",
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const drawerBodyStyle: CSSProperties = {
  padding: 22,
  overflowY: "auto",
  display: "grid",
  gap: 16,
};

const drawerFooterStyle: CSSProperties = {
  padding: 22,
  borderTop: "1px solid var(--border-soft)",
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};

const previewBoxStyle: CSSProperties = {
  height: 220,
  borderRadius: 18,
  border: "1px dashed var(--border-soft)",
  background: "var(--bg-soft)",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  cursor: "pointer",
};

const previewImageStyle: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  display: "block",
};

const uploadPromptStyle: CSSProperties = {
  color: "var(--text-muted)",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: "12px",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  outline: "none",
};

const twoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const checkboxGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const checkboxLabelStyle: CSSProperties = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  color: "var(--text-main)",
  fontWeight: 800,
};

const mutedSmallTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: "0.82rem",
};

const miniMetricStyle: CSSProperties = {
  background: "var(--bg-soft)",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: 12,
};

const errorBoxStyle: CSSProperties = {
  marginTop: 24,
  padding: 16,
  borderRadius: 14,
  border: "1px solid var(--danger-text)",
  background: "var(--danger-bg)",
  color: "var(--danger-text)",
  fontWeight: 800,
};

const successBoxStyle: CSSProperties = {
  marginTop: 24,
  padding: 16,
  borderRadius: 14,
  border: "1px solid var(--success-text)",
  background: "var(--success-bg)",
  color: "var(--success-text)",
  fontWeight: 800,
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.48)",
  zIndex: 120,
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const confirmModalStyle: CSSProperties = {
  width: "min(520px, 100%)",
  borderRadius: 22,
  background: "var(--bg-card)",
  color: "var(--text-main)",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
  padding: 26,
};

const confirmIconStyle: CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 18,
  background: "var(--danger-bg)",
  color: "var(--danger-text)",
  display: "grid",
  placeItems: "center",
};

const confirmProductBoxStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  border: "1px solid var(--border-soft)",
  borderRadius: 16,
  padding: 14,
  background: "var(--bg-soft)",
  marginTop: 16,
};

const confirmActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 22,
};