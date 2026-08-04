import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  createAdminReward,
  deleteAdminReward,
  listAdminRewards,
  setAdminRewardPinned,
  setAdminRewardVisible,
  updateAdminReward,
  uploadRewardImage,
  type AdminReward,
  type AdminRewardPayload,
  type RewardSummary,
} from "../services/adminRewardsApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

type SortOption = "default" | "name" | "points" | "stock" | "seasonal";

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

const emptyRewardForm: RewardFormState = {
  name: "",
  related_product: "",
  description: "",
  points_required: "150",
  min_tier: "Bronze",
  stock_quantity: "100",
  image_url: "",
  is_pinned: false,
  is_seasonal: false,
  is_visible: true,
  status: "Active",
  admin_notes: "",
};
const REWARD_IMAGE_VERTICAL_OFFSET = "-30%";

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

function getRewardImages(reward: AdminReward) {
  const text = `${reward.name} ${reward.related_product || ""}`.toLowerCase();

  const isYurokaBundle =
    text.includes("yuroka bundle") ||
    (
      text.includes("yuroka green") &&
      text.includes("yuroka purple") &&
      text.includes("yuroka red") &&
      text.includes("yuroka yellow")
    );

  if (isYurokaBundle) {
    return [
      "/product-images/yuroka-16-16-16.png",
      "/product-images/yuroka-17-7-17.png",
      "/product-images/yuroka-19-6-19.png",
      "/product-images/yuroka-21-0-21.png",
    ];
  }

  const imageSrc = getImageSrc(reward.image_url);
  return imageSrc ? [imageSrc] : [];
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

function pinnedRank(reward: AdminReward) {
  return reward.is_pinned ? 0 : 1;
}

function visibleRank(reward: AdminReward) {
  return reward.is_visible ? 0 : 1;
}

function seasonalRank(reward: AdminReward) {
  return reward.is_seasonal ? 0 : 1;
}

function tierRank(tier: string) {
  const normalized = tier.toLowerCase();

  if (normalized === "diamond" || normalized === "premium") return 4;
  if (normalized === "gold") return 3;
  if (normalized === "silver") return 2;
  return 1;
}

function getRewardDisplayName(reward: AdminReward) {
  const text = `${reward.name} ${reward.related_product || ""}`.toLowerCase();

  const isYurokaBundle =
    text.includes("yuroka bundle") ||
    (
      text.includes("yuroka green") &&
      text.includes("yuroka purple") &&
      text.includes("yuroka red") &&
      text.includes("yuroka yellow")
    );

  if (isYurokaBundle) return "Yuroka Bundle";

  return reward.name;
}

function cleanRewardDescription(reward: AdminReward) {
  const description = reward.description || "";

  return description
    .replace(/^retailers can redeem points for\s*/i, "")
    .replace(/\s*as a promoted product reward\.?$/i, "")
    .replace(/^redeem points for\s*/i, "")
    .trim();
}

function getRewardDescriptionParts(reward: AdminReward) {
  const cleanDescription = cleanRewardDescription(reward);

  if (!cleanDescription) {
    return {
      label: reward.related_product || reward.name,
      body: "Reward item available for redemption.",
    };
  }

  if (cleanDescription.includes(":")) {
    const [label, ...bodyParts] = cleanDescription.split(":");

    return {
      label: label.trim(),
      body: bodyParts.join(":").trim(),
    };
  }

  return {
    label: reward.related_product || reward.name,
    body: cleanDescription,
  };
}

function tierColor(tier: string) {
  const normalized = tier.toLowerCase();

  if (normalized === "bronze") {
    return {
      background: "#b56729",
      border: "1px solid #9a4f1f",
      color: "white",
    };
  }

  if (normalized === "silver") {
    return {
      background: "#807f83",
      border: "1px solid #66666a",
      color: "white",
    };
  }

  if (normalized === "gold") {
    return {
      background: "#d89010",
      border: "1px solid #b87508",
      color: "white",
    };
  }

  return {
    background: "#06357a",
    border: "1px solid #04265a",
    color: "white",
  };
}


function fallbackT(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

export default function Rewards() {
  const { t } = useAppPreferences();

  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [summary, setSummary] = useState<RewardSummary | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [includeHidden, setIncludeHidden] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedReward, setSelectedReward] = useState<AdminReward | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyRewardForm);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminReward | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadRewards() {
    setLoading(true);
    setError("");

    try {
      const data = await listAdminRewards({ includeHidden });
      setRewards(data.rewards);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeHidden]);

  const tiers = useMemo(() => {
    return Array.from(
      new Set(rewards.map((reward) => reward.min_tier || "Bronze"))
    ).sort((a, b) => tierRank(a) - tierRank(b));
  }, [rewards]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(rewards.map((reward) => reward.status || "Active"))
    ).sort();
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return rewards
      .filter((reward) => {
        const matchesSearch =
          !normalizedSearch ||
          rewardDisplayId(reward).toLowerCase().includes(normalizedSearch) ||
          reward.name.toLowerCase().includes(normalizedSearch) ||
          (reward.related_product || "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          reward.description.toLowerCase().includes(normalizedSearch);

        const matchesTier =
          tierFilter === "all" || reward.min_tier === tierFilter;

        const matchesStatus =
          statusFilter === "all" || reward.status === statusFilter;

        return matchesSearch && matchesTier && matchesStatus;
      })
      .sort((a, b) => {
        const pinnedCompare = pinnedRank(a) - pinnedRank(b);

        if (pinnedCompare !== 0) {
          return pinnedCompare;
        }

        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "points") {
          return (
            Number(a.points_required || 0) - Number(b.points_required || 0) ||
            a.name.localeCompare(b.name)
          );
        }

        if (sortBy === "stock") {
          return (
            Number(b.stock_quantity || 0) - Number(a.stock_quantity || 0) ||
            a.name.localeCompare(b.name)
          );
        }

        if (sortBy === "seasonal") {
          return (
            seasonalRank(a) - seasonalRank(b) ||
            visibleRank(a) - visibleRank(b) ||
            a.name.localeCompare(b.name)
          );
        }

        return (
          visibleRank(a) - visibleRank(b) ||
          seasonalRank(a) - seasonalRank(b) ||
          Number(a.points_required || 0) - Number(b.points_required || 0) ||
          a.name.localeCompare(b.name)
        );
      });
  }, [rewards, searchTerm, tierFilter, statusFilter, sortBy]);

  function updateForm<K extends keyof RewardFormState>(
    key: K,
    value: RewardFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateDrawer() {
    setMode("create");
    setSelectedReward(null);
    setForm(emptyRewardForm);
    setDrawerOpen(true);
    setError("");
    setSuccessMessage("");
  }

  function openEditDrawer(reward: AdminReward) {
    setMode("edit");
    setSelectedReward(reward);
    setForm(createFormFromReward(reward));
    setDrawerOpen(true);
    setMenuOpenId(null);
    setError("");
    setSuccessMessage("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedReward(null);
    setForm(emptyRewardForm);
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

      if (mode === "edit" && selectedReward) {
        await updateAdminReward(selectedReward.reward_id, {
          ...payload,
          comment: "Reward updated from rewards page.",
        });
        setSuccessMessage("Reward updated successfully.");
      } else {
        await createAdminReward(payload);
        setSuccessMessage("Reward created successfully.");
      }

      closeDrawer();
      await loadRewards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reward.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(reward: AdminReward) {
    setMenuOpenId(null);
    setError("");
    setSuccessMessage("");

    try {
      await setAdminRewardPinned(reward.reward_id, !reward.is_pinned);
      setSuccessMessage(reward.is_pinned ? "Reward unpinned." : "Reward pinned.");
      await loadRewards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update pinned status."
      );
    }
  }

  async function handleToggleVisible(reward: AdminReward) {
    setMenuOpenId(null);
    setError("");
    setSuccessMessage("");

    try {
      await setAdminRewardVisible(reward.reward_id, !reward.is_visible);
      setSuccessMessage(
        reward.is_visible
          ? "Reward hidden from retailer interface."
          : "Reward restored to retailer interface."
      );
      await loadRewards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update visibility."
      );
    }
  }

  function requestDeleteReward(reward: AdminReward) {
    setMenuOpenId(null);
    setDeleteCandidate(reward);
  }

  async function confirmDeleteReward() {
    if (!deleteCandidate) return;

    setDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteAdminReward(deleteCandidate.reward_id);
      setSuccessMessage("Reward permanently removed.");
      setDeleteCandidate(null);
      await loadRewards();
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

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div style={pageHeaderStyle}>
          <div>
            <h1 style={{ marginBottom: 8 }}>
              {fallbackT(t, "rewards", "Rewards")}
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              {fallbackT(
                t,
                "rewardsSubtitle",
                "Manage reward items, points required, minimum tier, visibility, pinned status, seasonal status, and stock."
              )}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setPreviewMode((current) => !current)}
              className={previewMode ? "green-btn" : "secondary-btn"}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Eye size={18} />
              {previewMode
                ? fallbackT(t, "adminView", "Admin View")
                : fallbackT(t, "retailerPreview", "Retailer Preview")}
            </button>

            <button
              className="primary-btn"
              onClick={openCreateDrawer}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={18} />
              {fallbackT(t, "addReward", "Add Reward")}
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatBox
            title={fallbackT(t, "totalRewards", "Total Rewards")}
            value={summary?.total_rewards ?? rewards.length}
          />
          <StatBox
            title={fallbackT(t, "visibleRewards", "Visible Rewards")}
            value={summary?.visible_rewards ?? rewards.filter((r) => r.is_visible).length}
          />
          <StatBox
            title={fallbackT(t, "pinnedRewards", "Pinned Rewards")}
            value={summary?.pinned_rewards ?? rewards.filter((r) => r.is_pinned).length}
          />
          <StatBox
            title={fallbackT(t, "seasonalRewards", "Seasonal Rewards")}
            value={
              summary?.seasonal_rewards ??
              rewards.filter((r) => r.is_seasonal).length
            }
          />
        </div>

        <div className="card" style={filtersCardStyle}>
          <div style={searchBoxStyle}>
            <Search size={18} color="var(--text-muted)" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={fallbackT(
                t,
                "searchRewards",
                "Search reward name, ID, or description..."
              )}
              style={searchInputStyle}
            />
          </div>

          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">{fallbackT(t, "allTiers", "All Tiers")}</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">
              {fallbackT(t, "allStatuses", "All Statuses")}
            </option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            style={selectStyle}
          >
            <option value="default">
              {fallbackT(t, "sortDefaultPinned", "Default: Pinned First")}
            </option>
            <option value="name">{fallbackT(t, "sortByName", "Sort by Name")}</option>
            <option value="points">
              {fallbackT(t, "sortByPoints", "Sort by Points")}
            </option>
            <option value="stock">
              {fallbackT(t, "sortByStock", "Sort by Stock")}
            </option>
            <option value="seasonal">
              {fallbackT(t, "sortBySeasonal", "Sort by Seasonal")}
            </option>
          </select>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={includeHidden}
              onChange={(event) => setIncludeHidden(event.target.checked)}
            />
            {fallbackT(t, "showHidden", "Show hidden")}
          </label>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}
        {successMessage && <div style={successBoxStyle}>{successMessage}</div>}

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            Loading rewards from Postgres...
          </div>
        )}

        {!loading && filteredRewards.length === 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            No rewards found.
          </div>
        )}

        {!loading && filteredRewards.length > 0 && (
          <>
            <p style={{ color: "var(--text-muted)", marginTop: 18 }}>
              Showing <strong>{filteredRewards.length}</strong> reward
              {filteredRewards.length === 1 ? "" : "s"}
            </p>

            {previewMode ? (
              <RetailerRewardsPreview rewards={filteredRewards} t={t} />
            ) : (
              <div style={rewardGridStyle}>
                {filteredRewards.map((reward) => (
                  <RewardCard
                    key={reward.reward_id}
                    reward={reward}
                    t={t}
                    menuOpen={menuOpenId === reward.reward_id}
                    onOpenMenu={() =>
                      setMenuOpenId((current) =>
                        current === reward.reward_id ? null : reward.reward_id
                      )
                    }
                    onEdit={() => openEditDrawer(reward)}
                    onTogglePin={() => handleTogglePin(reward)}
                    onToggleVisible={() => handleToggleVisible(reward)}
                    onDelete={() => requestDeleteReward(reward)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {drawerOpen && (
          <RewardDrawer
            mode={mode}
            form={form}
            saving={saving}
            uploadingImage={uploadingImage}
            t={t}
            onUpdate={updateForm}
            onUploadImage={handleUploadImage}
            onClose={closeDrawer}
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

function RewardCard({
  reward,
  t,
  menuOpen,
  onOpenMenu,
  onEdit,
  onTogglePin,
  onToggleVisible,
  onDelete,
}: {
  reward: AdminReward;
  t: (key: string) => string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}) {
  const displayName = getRewardDisplayName(reward);

  return (
    <article
      className="card"
      style={{
        ...rewardCardStyle,
        opacity: reward.is_visible ? 1 : 0.48,
        filter: reward.is_visible ? "none" : "grayscale(0.25)",
        border: reward.is_visible
          ? "2px solid rgba(122, 193, 67, 0.34)"
          : "1px dashed rgba(128, 127, 131, 0.65)",
        boxShadow: reward.is_visible
          ? "0 12px 28px rgba(6, 53, 122, 0.10)"
          : "0 6px 16px rgba(16, 24, 40, 0.05)",
      }}
    >
      {reward.is_pinned && <div style={pinnedTopBarStyle} />}

      <div style={imagePanelStyle}>
        <Link
          to={`/rewards/${reward.reward_id}`}
          style={imageLinkStyle}
        >
          <RewardImageCarousel reward={reward} />
        </Link>

        <div style={actionOverlayStyle}>
          <button
            onClick={onOpenMenu}
            style={imageActionButtonStyle}
            aria-label="Reward actions"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div style={menuStyle}>
              <Link
                to={`/rewards/${reward.reward_id}`}
                style={{ ...menuButtonStyle, textDecoration: "none" }}
              >
                {fallbackT(t, "details", "Details")}
              </Link>

              <button style={menuButtonStyle} onClick={onEdit}>
                <Pencil size={15} />
                {fallbackT(t, "edit", "Edit")}
              </button>

              <button style={menuButtonStyle} onClick={onTogglePin}>
                {reward.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
                {reward.is_pinned
                  ? fallbackT(t, "unpin", "Unpin")
                  : fallbackT(t, "pin", "Pin")}
              </button>

              <button style={menuButtonStyle} onClick={onToggleVisible}>
                {reward.is_visible ? <EyeOff size={15} /> : <Eye size={15} />}
                {reward.is_visible
                  ? fallbackT(t, "hide", "Hide")
                  : fallbackT(t, "show", "Show")}
              </button>

              <button
                style={{ ...menuButtonStyle, color: "var(--danger-text)" }}
                onClick={onDelete}
              >
                <Trash2 size={15} />
                {fallbackT(t, "remove", "Remove")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={rewardCardBodyStyle}>
        <div style={rewardStatusRowStyle}>
          {reward.is_pinned && (
            <Badge label={fallbackT(t, "pinned", "Pinned")} type="blue" />
          )}

          {reward.is_seasonal && (
            <Badge label={fallbackT(t, "seasonal", "Seasonal")} type="yellow" />
          )}

          {!reward.is_visible && (
            <span style={hiddenTextBadgeStyle}>
              <EyeOff size={13} />
              {fallbackT(t, "hidden", "Hidden")}
            </span>
          )}
        </div>

        <p style={mutedSmallTextStyle}>{rewardDisplayId(reward)}</p>

        <Link
          to={`/rewards/${reward.reward_id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <h2 style={rewardTitleStyle}>{displayName}</h2>
        </Link>

        <RewardDescription reward={reward} />

        <RewardPrimaryMetrics reward={reward} t={t} />

        <p style={stockLineStyle}>
          {fallbackT(t, "stockQuantity", "Stock Quantity")}:{" "}
          <strong>{Number(reward.stock_quantity || 0).toLocaleString()}</strong>
        </p>
      </div>

      <div style={rewardStatusBarStyle(reward)} />
    </article>
  );
}

function RewardPrimaryMetrics({
  reward,
  t,
}: {
  reward: AdminReward;
  t: (key: string) => string;
}) {
  const tierStyle = tierColor(reward.min_tier);

  return (
    <div style={primaryMetricsStyle}>
      <div style={pointsRequiredStyle}>
        <span>{fallbackT(t, "pointsRequired", "Points Required")}</span>

        <strong style={pointsValueStyle}>
          {Number(reward.points_required || 0).toLocaleString()}
          <span style={pointsSymbolStyle}>P</span>
        </strong>
      </div>

      <div style={tierColumnStyle}>
        <span style={tierLabelStyle}>
          {fallbackT(t, "minimumTier", "Minimum Tier")}
        </span>

        <strong
          style={{
            ...tierCapsuleStyle,
            background: tierStyle.background,
            border: tierStyle.border,
            color: tierStyle.color,
          }}
        >
          {reward.min_tier}
        </strong>
      </div>
    </div>
  );
}

function RewardDescription({ reward }: { reward: AdminReward }) {
  const description = getRewardDescriptionParts(reward);

  return (
    <p style={descriptionStyle}>
      <strong style={descriptionLabelStyle}>{description.label}</strong>
      <span style={descriptionDotStyle}> · </span>
      <span>{description.body}</span>
    </p>
  );
}

function RewardPreviewDescription({ reward }: { reward: AdminReward }) {
  const description = getRewardDescriptionParts(reward);
  const body =
    description.body.length > 86
      ? `${description.body.slice(0, 86)}...`
      : description.body;

  return (
    <p style={previewDescriptionStyle}>
      <strong style={descriptionLabelStyle}>{description.label}</strong>
      <span style={descriptionDotStyle}> · </span>
      <span>{body}</span>
    </p>
  );
}

function RewardImageCarousel({ reward }: { reward: AdminReward }) {
  const images = getRewardImages(reward);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [images.length, reward.reward_id]);

  if (images.length === 0) {
    return <div style={imageFallbackStyle}>Reward</div>;
  }

  return (
    <>
      <img
        src={images[activeIndex]}
        alt={reward.name}
        style={rewardImageStyle}
      />

      {images.length > 1 && (
        <div style={carouselDotsStyle}>
          {images.map((image, index) => (
            <span
              key={image}
              style={{
                ...carouselDotStyle,
                opacity: index === activeIndex ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      )}

      {!reward.is_visible && (
        <div style={hiddenImageMaskStyle}>
          <EyeOff size={22} />
          <span>Hidden</span>
        </div>
      )}
    </>
  );
}

function RewardDrawer({
  mode,
  form,
  saving,
  uploadingImage,
  t,
  onUpdate,
  onUploadImage,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
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
              {mode === "edit"
                ? fallbackT(t, "editReward", "Edit Reward")
                : fallbackT(t, "addReward", "Add Reward")}
            </p>
            <h2 style={{ margin: "4px 0 0" }}>
              {mode === "edit" ? form.name : fallbackT(t, "addReward", "Add Reward")}
            </h2>
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
              placeholder="Example: Entec Reward Bundle"
              onChange={(event) => onUpdate("name", event.target.value)}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Related Product" optional>
            <input
              value={form.related_product}
              placeholder="Example: Entec 20-10-10"
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
                placeholder="150, 250, 400, 600"
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
                placeholder="100"
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
              placeholder="/product-images/entec-20-10-10.png"
              onChange={(event) => onUpdate("image_url", event.target.value)}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={form.description}
              placeholder="Describe what the retailer receives when redeeming this reward."
              onChange={(event) => onUpdate("description", event.target.value)}
              style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
            />
          </FormField>

          <FormField label={fallbackT(t, "adminNotes", "Admin Notes")} optional>
            <textarea
              value={form.admin_notes}
              placeholder="Internal admin notes about this reward."
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

function RetailerRewardsPreview({
  rewards,
  t,
}: {
  rewards: AdminReward[];
  t: (key: string) => string;
}) {
  const visibleRewards = rewards.filter((reward) => reward.is_visible);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={previewBannerStyle}>
        <p style={previewEyebrowStyle}>
          {fallbackT(t, "retailerPreview", "Retailer Preview")}
        </p>
        <h2 style={{ marginBottom: 0 }}>
          Preview of how visible and pinned rewards may appear to retailers.
        </h2>
      </div>

      <div style={previewGridStyle}>
        {visibleRewards.map((reward) => {
          const imageSrc = getImageSrc(reward.image_url);

          return (
            <div
              key={reward.reward_id}
              style={{
                ...previewCardStyle,
                border: reward.is_pinned
                  ? "2px solid var(--agricare-green)"
                  : "1px solid rgba(6, 53, 122, 0.06)",
              }}
            >
              <div style={{ position: "relative" }}>
                {imageSrc ? (
                  <img src={imageSrc} alt={reward.name} style={previewImageStyle2} />
                ) : (
                  <div style={{ ...previewImageStyle2, display: "grid", placeItems: "center" }}>
                    Reward
                  </div>
                )}

                {reward.is_pinned && (
                  <span style={featuredBadgeStyle}>
                    {fallbackT(t, "featured", "Featured")}
                  </span>
                )}
              </div>

              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 8px" }}>{reward.name}</h3>
                <RewardPreviewDescription reward={reward} />

                <strong style={{ color: "var(--bm-blue)" }}>
                  {Number(reward.points_required || 0).toLocaleString()} pts ·{" "}
                  {reward.min_tier}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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

function StatBox({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <p style={statTitleStyle}>{title}</p>
      <strong style={statValueStyle}>{value}</strong>
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

const pageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginTop: 22,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 20,
  marginTop: 24,
};

const filtersCardStyle: CSSProperties = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
  gap: 14,
  alignItems: "center",
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

const checkboxLabelStyle: CSSProperties = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  color: "var(--text-main)",
  fontWeight: 800,
};

const rewardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
  marginTop: 20,
  alignItems: "stretch",
};

const rewardCardStyle: CSSProperties = {
  padding: 0,
  overflow: "visible",
  position: "relative",
  minHeight: 390,
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const pinnedTopBarStyle: CSSProperties = {
  height: 10,
  background: "var(--bm-sky-blue, #6799c8)",
  borderRadius: "18px 18px 0 0",
};

const imagePanelStyle: CSSProperties = {
  height: 170,
  background:
    "linear-gradient(135deg, rgba(122,193,67,0.08), rgba(103,153,200,0.14))",
  display: "grid",
  placeItems: "center",
  position: "relative",
  overflow: "visible",
};

const imageLinkStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "inherit",
  textDecoration: "none",
  overflow: "hidden",
};

const rewardImageStyle: CSSProperties = {
  maxWidth: "62%",
  maxHeight: "62%",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  objectPosition: "center center",
  display: "block",
  transform: `translateY(${REWARD_IMAGE_VERTICAL_OFFSET})`,
};

const actionOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 40,
};

const imageActionButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "1px solid rgba(6, 53, 122, 0.12)",
  background: "rgba(255, 255, 255, 0.92)",
  color: "var(--text-main)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(16, 24, 40, 0.10)",
};



const rewardCardBodyStyle: CSSProperties = {
  padding: "13px 14px 10px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
};

const rewardTitleStyle: CSSProperties = {
  margin: "4px 0",
  fontSize: "1.04rem",
  lineHeight: 1.2,
};

const primaryMetricsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.15fr 0.85fr",
  gap: 10,
  marginTop: "auto",
};

const pointsRequiredStyle: CSSProperties = {
  border: "1px solid rgba(6, 53, 122, 0.12)",
  background: "rgba(103, 153, 200, 0.12)",
  borderRadius: 14,
  padding: "9px 11px",
  display: "grid",
  gap: 5,
  color: "var(--text-muted)",
  fontSize: "0.76rem",
  fontWeight: 900,
};

const pointsValueStyle: CSSProperties = {
  color: "var(--text-brand-readable)",
  fontSize: "1.24rem",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
};

const imageFallbackStyle: CSSProperties = {
  width: 90,
  height: 90,
  borderRadius: "50%",
  background: "var(--bm-blue)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const pointsSymbolStyle: CSSProperties = {
  width: 23,
  height: 23,
  borderRadius: "50%",
  background: "var(--agricare-green)",
  color: "white",
  display: "inline-grid",
  placeItems: "center",
  fontSize: "0.72rem",
  fontWeight: 900,
};

const tierColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-end",
  gap: 7,
  minWidth: 0,
  justifySelf: "end",
  paddingLeft: 4,
  paddingRight: 8,
};

const tierLabelStyle: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.76rem",
  fontWeight: 900,
  textAlign: "right",
};

const tierCapsuleStyle: CSSProperties = {
  width: "fit-content",
  minWidth: 78,
  borderRadius: 999,
  padding: "7px 13px",
  textAlign: "center",
  fontSize: "0.86rem",
  fontWeight: 950,
  letterSpacing: 0.2,
  boxShadow: "0 8px 16px rgba(16, 24, 40, 0.12)",
};

const stockLineStyle: CSSProperties = {
  margin: "9px 0 0",
  color: "var(--text-muted)",
  fontSize: "0.82rem",
};

const hiddenTextBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(128, 127, 131, 0.14)",
  color: "var(--text-muted)",
  fontWeight: 900,
  fontSize: 12,
};

const rewardStatusRowStyle: CSSProperties = {
  minHeight: 26,
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 8,
};


const descriptionStyle: CSSProperties = {
  color: "var(--text-muted)",
  lineHeight: 1.4,
  minHeight: 40,
  maxHeight: 58,
  overflow: "hidden",
  fontSize: "0.88rem",
  margin: "7px 0 10px",
};

const carouselDotsStyle: CSSProperties = {
  position: "absolute",
  bottom: 8,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  gap: 5,
};

const carouselDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "var(--bm-blue)",
};

const hiddenImageMaskStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(15, 23, 42, 0.42)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  textAlign: "center",
  gap: 4,
};

function rewardStatusBarStyle(reward: AdminReward): CSSProperties {
  const base: CSSProperties = {
    height: 9,
    borderRadius: "0 0 18px 18px",
    marginTop: "auto",
    flexShrink: 0,
  };

  if (!reward.is_visible) {
    return {
      ...base,
      background: "rgba(128, 127, 131, 0.78)",
    };
  }

  if (reward.status.toLowerCase() === "draft") {
    return {
      ...base,
      background: "var(--bm-yellow, #fbb034)",
    };
  }

  return {
    ...base,
    background: "var(--agricare-green)",
  };
}

const descriptionLabelStyle: CSSProperties = {
  color: "var(--text-main)",
  fontWeight: 950,
};

const descriptionDotStyle: CSSProperties = {
  color: "var(--text-brand-readable)",
  fontWeight: 950,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 42,
  minWidth: 176,
  background: "var(--bg-card)",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  boxShadow: "0 12px 30px rgba(16, 32, 51, 0.18)",
  padding: 8,
  zIndex: 80,
};

const menuButtonStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 10,
  fontWeight: 800,
  color: "var(--text-main)",
  display: "flex",
  alignItems: "center",
  gap: 8,
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
};

const mutedSmallTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: "0.82rem",
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

const previewBannerStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(122,193,67,0.16), rgba(103,153,200,0.18))",
  border: "1px solid rgba(6, 53, 122, 0.08)",
  borderRadius: 24,
  padding: 24,
  marginBottom: 20,
};

const previewEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--bm-blue)",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  fontSize: 13,
};

const previewGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 18,
};

const previewCardStyle: CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(6, 53, 122, 0.08)",
};

const previewImageStyle2: CSSProperties = {
  width: "100%",
  height: 140,
  objectFit: "contain",
  padding: 12,
  background: "var(--bg-soft)",
};

const featuredBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  background: "var(--agricare-green)",
  color: "white",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
};

const previewDescriptionStyle: CSSProperties = {
  color: "var(--text-muted)",
  lineHeight: 1.5,
  fontSize: 14,
};