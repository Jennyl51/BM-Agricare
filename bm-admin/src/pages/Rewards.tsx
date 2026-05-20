import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { rewards as rewardData } from "../data/mockData";

type Reward = (typeof rewardData)[number];
type SortOption = "id" | "name" | "points" | "stock";
type TierFilter = "all" | string;
type StatusFilter = "all" | string;

const emptyReward: Reward = {
  gift_id: 999,
  id: "RWD-NEW",
  name: "",
  description: "",
  points_required: 0,
  points: 0,
  min_tier: "Silver",
  tier: "Silver",
  stock_quantity: 0,
  stock: 0,
  image_url: "https://placehold.co/500x320/e7f6ec/06357a?text=New+Reward",
  is_pinned: false,
  is_seasonal: false,
  is_visible: true,
  status: "Draft",
};

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>(rewardData);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const tiers = useMemo(() => {
    return Array.from(new Set(rewards.map((reward) => reward.min_tier)));
  }, [rewards]);

  const statuses = useMemo(() => {
    return Array.from(new Set(rewards.map((reward) => reward.status)));
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return [...rewards]
      .filter((reward) => {
        const matchesSearch =
          reward.id.toLowerCase().includes(normalizedSearch) ||
          reward.name.toLowerCase().includes(normalizedSearch) ||
          reward.description.toLowerCase().includes(normalizedSearch);

        const matchesTier =
          tierFilter === "all" || reward.min_tier === tierFilter;

        const matchesStatus =
          statusFilter === "all" || reward.status === statusFilter;

        return matchesSearch && matchesTier && matchesStatus;
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1;
        }

        if (sortBy === "id") return a.gift_id - b.gift_id;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "points") return b.points_required - a.points_required;
        if (sortBy === "stock") return b.stock_quantity - a.stock_quantity;

        return 0;
      });
  }, [rewards, searchTerm, tierFilter, statusFilter, sortBy]);

  const handleSaveReward = (updatedReward: Reward) => {
    const normalizedReward = {
      ...updatedReward,
      points: updatedReward.points_required,
      tier: updatedReward.min_tier,
      stock: updatedReward.stock_quantity,
    };

    setRewards((currentRewards) => {
      const existing = currentRewards.some(
        (reward) => reward.gift_id === normalizedReward.gift_id
      );

      if (existing) {
        return currentRewards.map((reward) =>
          reward.gift_id === normalizedReward.gift_id
            ? normalizedReward
            : reward
        );
      }

      return [...currentRewards, normalizedReward];
    });

    setEditingReward(null);
  };

  const handleAddReward = () => {
    const nextGiftId =
      rewards.length > 0
        ? Math.max(...rewards.map((reward) => reward.gift_id)) + 1
        : 1;

    setEditingReward({
      ...emptyReward,
      gift_id: nextGiftId,
      id: `RWD-${String(nextGiftId).padStart(3, "0")}`,
    });
  };

  const handleTogglePin = (giftId: number) => {
    setRewards((currentRewards) =>
      currentRewards.map((reward) =>
        reward.gift_id === giftId
          ? { ...reward, is_pinned: !reward.is_pinned }
          : reward
      )
    );
    setMenuOpenId(null);
  };

  const handleToggleVisible = (giftId: number) => {
    setRewards((currentRewards) =>
      currentRewards.map((reward) =>
        reward.gift_id === giftId
          ? { ...reward, is_visible: !reward.is_visible }
          : reward
      )
    );
    setMenuOpenId(null);
  };

  const handleDeleteReward = (giftId: number) => {
    setRewards((currentRewards) =>
      currentRewards.filter((reward) => reward.gift_id !== giftId)
    );
    setMenuOpenId(null);
  };

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
            <h1 style={{ marginBottom: 8 }}>Rewards</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Manage reward items, points required, minimum tier, visibility,
              pinned status, and stock.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setPreviewMode((current) => !current)}
              className={previewMode ? "green-btn" : "secondary-btn"}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Eye size={18} />
              {previewMode ? "Admin View" : "Retailer Preview"}
            </button>

            <button
              className="primary-btn"
              onClick={handleAddReward}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={18} />
              Add Reward
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
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search reward name, ID, or description..."
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
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">All Statuses</option>
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
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
            <option value="points">Sort by Points</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>

        <p style={{ color: "var(--text-muted)", marginTop: 18 }}>
          Showing <strong>{filteredRewards.length}</strong> reward
          {filteredRewards.length === 1 ? "" : "s"}
        </p>

        {previewMode ? (
          <RetailerRewardsPreview rewards={filteredRewards} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 20,
            }}
          >
            {filteredRewards.map((reward) => (
              <div
                className="card"
                key={reward.gift_id}
                style={{
                  padding: 0,
                  overflow: "visible",
                  opacity: reward.is_visible ? 1 : 0.55,
                  position: "relative",
                }}
              >
                <Link
                  to={`/rewards/${reward.gift_id}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderTopLeftRadius: "var(--radius-lg)",
                        borderTopRightRadius: "var(--radius-lg)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {reward.is_pinned && <Badge label="Pinned" type="blue" />}
                      {reward.is_seasonal && (
                        <Badge label="Seasonal" type="yellow" />
                      )}
                      {!reward.is_visible && <Badge label="Hidden" type="gray" />}
                    </div>
                  </div>
                </Link>

                <div style={{ padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-muted)",
                          fontSize: 14,
                        }}
                      >
                        {reward.id}
                      </p>

                      <Link
                        to={`/rewards/${reward.gift_id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        <h2 style={{ margin: "6px 0" }}>{reward.name}</h2>
                      </Link>
                    </div>

                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() =>
                          setMenuOpenId(
                            menuOpenId === reward.gift_id
                              ? null
                              : reward.gift_id
                          )
                        }
                        style={iconButtonStyle}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {menuOpenId === reward.gift_id && (
                        <div style={menuStyle}>
                          <button
                            style={menuButtonStyle}
                            onClick={() => {
                              setEditingReward(reward);
                              setMenuOpenId(null);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            style={menuButtonStyle}
                            onClick={() => handleTogglePin(reward.gift_id)}
                          >
                            {reward.is_pinned ? "Unpin" : "Pin"}
                          </button>

                          <button
                            style={menuButtonStyle}
                            onClick={() => handleToggleVisible(reward.gift_id)}
                          >
                            {reward.is_visible ? "Hide" : "Show"}
                          </button>

                          <button
                            style={{
                              ...menuButtonStyle,
                              color: "var(--ingredients-red)",
                            }}
                            onClick={() => handleDeleteReward(reward.gift_id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {reward.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <MiniMetric
                      label="Points Required"
                      value={reward.points_required.toLocaleString()}
                    />
                    <MiniMetric label="Min Tier" value={reward.min_tier} />
                    <MiniMetric
                      label="Stock"
                      value={reward.stock_quantity.toLocaleString()}
                    />
                    <MiniMetric label="Status" value={reward.status} />
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() => setEditingReward(reward)}
                    style={{ marginTop: 18 }}
                  >
                    Edit Reward
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingReward && (
          <RewardModal
            reward={editingReward}
            onClose={() => setEditingReward(null)}
            onSave={handleSaveReward}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function RewardModal({
  reward,
  onClose,
  onSave,
}: {
  reward: Reward;
  onClose: () => void;
  onSave: (reward: Reward) => void;
}) {
  const [draft, setDraft] = useState<Reward>(reward);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSave({
      ...draft,
      points: draft.points_required,
      tier: draft.min_tier,
      stock: draft.stock_quantity,
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <form
        className="card"
        onSubmit={handleSubmit}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              {reward.name ? "Edit Reward" : "Add Reward"}
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              Update reward information shown to admins and retailer preview.
            </p>
          </div>

          <button type="button" onClick={onClose} style={iconButtonStyle}>
            <X size={24} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 24,
          }}
        >
          <FormField label="Reward Name">
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              style={inputStyle}
              required
            />
          </FormField>

          <FormField label="Reward ID">
            <input
              value={draft.id}
              onChange={(event) =>
                setDraft({ ...draft, id: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Points Required">
            <input
              type="number"
              value={draft.points_required}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  points_required: Number(event.target.value),
                })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Minimum Tier">
            <select
              value={draft.min_tier}
              onChange={(event) =>
                setDraft({ ...draft, min_tier: event.target.value })
              }
              style={inputStyle}
            >
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Premium">Premium</option>
            </select>
          </FormField>

          <FormField label="Stock Quantity">
            <input
              type="number"
              value={draft.stock_quantity}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  stock_quantity: Number(event.target.value),
                })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Status">
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value })
              }
              style={inputStyle}
            >
              <option value="Active">Active</option>
              <option value="Seasonal">Seasonal</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
          </FormField>
        </div>

        <FormField label="Image URL / Thumbnail">
          <input
            value={draft.image_url}
            onChange={(event) =>
              setDraft({ ...draft, image_url: event.target.value })
            }
            style={inputStyle}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          />
        </FormField>

        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={draft.is_pinned}
              onChange={(event) =>
                setDraft({ ...draft, is_pinned: event.target.checked })
              }
            />
            Pinned
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={draft.is_seasonal}
              onChange={(event) =>
                setDraft({ ...draft, is_seasonal: event.target.checked })
              }
            />
            Seasonal
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={draft.is_visible}
              onChange={(event) =>
                setDraft({ ...draft, is_visible: event.target.checked })
              }
            />
            Visible to retailers
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="primary-btn">
            Save Reward
          </button>
        </div>
      </form>
    </div>
  );
}

function RetailerRewardsPreview({ rewards }: { rewards: Reward[] }) {
  const visibleRewards = rewards.filter((reward) => reward.is_visible);

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(122,193,67,0.16), rgba(103,153,200,0.18))",
          border: "1px solid rgba(6, 53, 122, 0.08)",
          borderRadius: 24,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--bm-blue)",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            fontSize: 13,
          }}
        >
          Retailer Preview
        </p>
        <h2 style={{ marginBottom: 0 }}>
          Preview of how visible and pinned rewards may appear to retailers.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
      >
        {visibleRewards.map((reward) => (
          <div
            key={reward.gift_id}
            style={{
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(6, 53, 122, 0.08)",
              border: reward.is_pinned
                ? "2px solid var(--agricare-green)"
                : "1px solid rgba(6, 53, 122, 0.06)",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={reward.image_url}
                alt={reward.name}
                style={{ width: "100%", height: 130, objectFit: "cover" }}
              />

              {reward.is_pinned && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "var(--agricare-green)",
                    color: "white",
                    padding: "5px 9px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <div style={{ padding: 16 }}>
              <h3 style={{ margin: "0 0 8px" }}>{reward.name}</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  fontSize: 14,
                }}
              >
                {reward.description.slice(0, 96)}...
              </p>

              <strong style={{ color: "var(--bm-blue)" }}>
                {reward.points_required.toLocaleString()} pts · {reward.min_tier}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
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

function Badge({ label, type }: { label: string; type: "blue" | "yellow" | "gray" }) {
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
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8, marginTop: 16 }}>
      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
        {label}
      </span>
      {children}
    </label>
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "12px",
  background: "white",
  color: "var(--text-main)",
  outline: "none",
};

const iconButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "var(--bm-gray)",
};

const menuStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 32,
  width: 150,
  background: "white",
  border: "1px solid var(--border)",
  borderRadius: 14,
  boxShadow: "0 12px 30px rgba(16, 32, 51, 0.14)",
  padding: 8,
  zIndex: 30,
};

const menuButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 10,
  fontWeight: 700,
  color: "var(--text-main)",
};

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(16, 32, 51, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 24,
  zIndex: 999,
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
};