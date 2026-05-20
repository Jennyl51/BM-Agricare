import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { rewards } from "../data/mockData";

type Reward = (typeof rewards)[number];

export default function RewardDetail() {
  const { rewardId } = useParams();
  const initialReward = rewards.find(
    (reward) =>
      String(reward.gift_id) === rewardId ||
      reward.id === rewardId
  );

  const [reward, setReward] = useState<Reward | null>(initialReward ?? null);
  const [isEditing, setIsEditing] = useState(false);

  if (!reward) {
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
              This reward does not exist in the current mock dataset.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page">
        <Link to="/rewards" style={backLinkStyle}>
          <ArrowLeft size={18} />
          Back to Rewards
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <img
              src={reward.image_url}
              alt={reward.name}
              style={{
                width: "100%",
                height: 360,
                objectFit: "cover",
              }}
            />
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                  {reward.id}
                </p>
                <h1 style={{ margin: "8px 0" }}>{reward.name}</h1>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {reward.is_pinned && <Badge label="Pinned" type="blue" />}
                  {reward.is_seasonal && <Badge label="Seasonal" type="yellow" />}
                  {reward.is_visible ? (
                    <Badge label="Visible" type="green" />
                  ) : (
                    <Badge label="Hidden" type="gray" />
                  )}
                  <Badge label={reward.status} type="gray" />
                </div>
              </div>

              <button
                className="secondary-btn"
                onClick={() => setIsEditing(true)}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Edit size={17} />
                Edit
              </button>
            </div>

            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginTop: 22,
              }}
            >
              {reward.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginTop: 22,
              }}
            >
              <MiniMetric
                label="Points Required"
                value={reward.points_required.toLocaleString()}
              />
              <MiniMetric label="Minimum Tier" value={reward.min_tier} />
              <MiniMetric
                label="Stock"
                value={reward.stock_quantity.toLocaleString()}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button
                className="secondary-btn"
                onClick={() =>
                  setReward({ ...reward, is_pinned: !reward.is_pinned })
                }
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {reward.is_pinned ? <PinOff size={17} /> : <Pin size={17} />}
                {reward.is_pinned ? "Unpin" : "Pin"}
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  setReward({ ...reward, is_visible: !reward.is_visible })
                }
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {reward.is_visible ? <EyeOff size={17} /> : <Eye size={17} />}
                {reward.is_visible ? "Hide" : "Show"}
              </button>
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
            <h2>Reward Activity Log</h2>

            <ActivityLogItem
              icon={<PackageCheck size={18} />}
              title="Reward created"
              description="Created by BM Admin"
              time="2026-05-01 9:00 AM"
            />

            <ActivityLogItem
              icon={<Pin size={18} />}
              title={reward.is_pinned ? "Pinned to retailer page" : "Not pinned"}
              description={
                reward.is_pinned
                  ? "This reward will appear higher in retailer reward lists."
                  : "This reward follows the default sorting order."
              }
              time="Current status"
            />

            <ActivityLogItem
              icon={<Eye size={18} />}
              title={reward.is_visible ? "Visible to retailers" : "Hidden from retailers"}
              description={
                reward.is_visible
                  ? "Retailers can currently see this reward."
                  : "Retailers cannot currently see this reward."
              }
              time="Current status"
            />
          </div>

          <div className="card">
            <h2>Retailer Preview</h2>
            <div
              style={{
                marginTop: 16,
                borderRadius: 22,
                overflow: "hidden",
                border: reward.is_pinned
                  ? "2px solid var(--agricare-green)"
                  : "1px solid var(--border)",
                maxWidth: 360,
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  style={{ width: "100%", height: 180, objectFit: "cover" }}
                />

                {reward.is_pinned && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "var(--agricare-green)",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Featured
                  </span>
                )}
              </div>

              <div style={{ padding: 18 }}>
                <h3 style={{ margin: "0 0 8px" }}>{reward.name}</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {reward.description.slice(0, 120)}...
                </p>
                <strong style={{ color: "var(--bm-blue)" }}>
                  {reward.points_required.toLocaleString()} pts · {reward.min_tier}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Admin Notes</h2>
          <textarea
            placeholder="Add internal notes/comments about this reward..."
            style={{
              marginTop: 12,
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

        {isEditing && (
          <RewardEditModal
            reward={reward}
            onClose={() => setIsEditing(false)}
            onSave={(updatedReward) => {
              setReward(updatedReward);
              setIsEditing(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function RewardEditModal({
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
        onSubmit={handleSubmit}
        className="card"
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
            <h2 style={{ margin: 0 }}>Edit Reward</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              Update reward details and retailer visibility.
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

        <FormField label="Image URL">
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

function ActivityLogItem({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr",
        gap: 12,
        borderTop: "1px solid #eee",
        padding: "16px 0",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(103, 153, 200, 0.16)",
          color: "var(--bm-blue)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
          {description}
        </p>
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Calendar size={14} />
          {time}
        </p>
      </div>
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

const backLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "var(--bm-blue)",
  fontWeight: 800,
  textDecoration: "none",
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