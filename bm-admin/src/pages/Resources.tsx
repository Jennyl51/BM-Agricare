import { useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  MoreVertical,
  Newspaper,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

type ResourceType = "guideline" | "news";
type SortOption = "newest" | "oldest" | "title";

type ResourceItem = {
  id: string;
  type: ResourceType;
  title: string;
  category: string;
  related_products: string[];
  thumbnail_url: string;
  pdf_url?: string;
  article_url?: string;
  summary: string;
  created_at?: string;
  published_date?: string;
  is_pinned: boolean;
  is_visible: boolean;
};

const initialResources: ResourceItem[] = [
  {
    id: "TG-001",
    type: "guideline",
    title: "Proper Fertilizer Use for Durian",
    category: "Technical Guideline",
    related_products: ["Nitrophoska Durian", "Entec Premium"],
    thumbnail_url:
      "https://placehold.co/600x360/e7f6ec/06357a?text=Durian+Fertilizer+Guide",
    pdf_url: "https://example.com/guidelines/durian-fertilizer-guide.pdf",
    summary:
      "Recommended fertilizer timing, nutrient balance, and retailer guidance for durian crop support.",
    created_at: "2026-05-01",
    is_pinned: true,
    is_visible: true,
  },
  {
    id: "TG-002",
    type: "guideline",
    title: "Soil Health and Organic Nutrition Guide",
    category: "Soil Health",
    related_products: ["Fertiganic Premium", "Fertiganic Soil Boost"],
    thumbnail_url:
      "https://placehold.co/600x360/f4f8ed/06357a?text=Soil+Health+Guide",
    pdf_url: "https://example.com/guidelines/soil-health-guide.pdf",
    summary:
      "Guidance for improving soil vitality, microbial activity, organic nutrition, and long-term crop resilience.",
    created_at: "2026-05-03",
    is_pinned: false,
    is_visible: true,
  },
  {
    id: "TG-003",
    type: "guideline",
    title: "Nitrogen Efficiency with Entec",
    category: "Fertilizer",
    related_products: ["Entec Premium", "Entec Solub", "Entec Perfect"],
    thumbnail_url:
      "https://placehold.co/600x360/e7f6ec/06357a?text=Entec+Nitrogen+Efficiency",
    pdf_url: "https://example.com/guidelines/entec-nitrogen-efficiency.pdf",
    summary:
      "Explains stabilized nitrogen, reduced leaching, and improved nitrogen-use efficiency for crop performance.",
    created_at: "2026-05-05",
    is_pinned: false,
    is_visible: true,
  },
  {
    id: "NEWS-001",
    type: "news",
    title: "A Journey of Growth and Association with Behn Meyer AgriCare",
    category: "AgriCare Vietnam",
    related_products: ["Nitrophoska Durian", "Fertiganic Premium"],
    thumbnail_url:
      "https://placehold.co/600x360/dff0fb/06357a?text=AgriCare+Vietnam+Visit",
    article_url: "https://www.behnmeyer.com",
    summary:
      "Behn Meyer AgriCare Vietnam welcomed Mr Teo Teng Seng and partners to key agricultural areas including vegetables, durian, and coffee.",
    published_date: "2026-05-02",
    is_pinned: true,
    is_visible: true,
  },
  {
    id: "NEWS-002",
    type: "news",
    title: "Behn Meyer AgriCare Introduces Agri Analytics & Services",
    category: "Agri Analytics",
    related_products: ["Agri Analytics & Services"],
    thumbnail_url:
      "https://placehold.co/600x360/eaf2fb/06357a?text=Agri+Analytics+Services",
    article_url: "https://www.behnmeyer.com",
    summary:
      "A new division using geospatial and remote sensing technologies to improve plantation performance and support data-driven farming decisions.",
    published_date: "2026-05-04",
    is_pinned: false,
    is_visible: true,
  },
  {
    id: "NEWS-003",
    type: "news",
    title: "Behn Meyer AgriCare Vietnam Warehouse Inauguration in Phu My",
    category: "Company News",
    related_products: ["BM AgriCare"],
    thumbnail_url:
      "https://placehold.co/600x360/f7faf5/06357a?text=Warehouse+Inauguration",
    article_url:
      "https://www.behnmeyer.com/news-detail/behn-meyer-agricare-vietnam-warehouse-inauguration-in-phu-my?id=7859732",
    summary:
      "News article from the Behn Meyer website related to AgriCare Vietnam operations.",
    published_date: "2026-04-28",
    is_pinned: false,
    is_visible: true,
  },
  {
    id: "NEWS-004",
    type: "news",
    title: "Behn Meyer AgriCare Vietnam Strategic Partners Summit 2026",
    category: "Company News",
    related_products: ["BM AgriCare"],
    thumbnail_url:
      "https://placehold.co/600x360/f7faf5/06357a?text=Strategic+Partners+Summit",
    article_url:
      "https://www.behnmeyer.com/news-detail/behn-meyer-agricare-vietnam-strategic-partners-summit-2026?id=7851088",
    summary:
      "Strategic partner summit news item from the official Behn Meyer website.",
    published_date: "2026-04-25",
    is_pinned: false,
    is_visible: true,
  },
];

const emptyResource: ResourceItem = {
  id: "NEW-RESOURCE",
  type: "guideline",
  title: "",
  category: "Technical Guideline",
  related_products: [],
  thumbnail_url:
    "https://placehold.co/600x360/e7f6ec/06357a?text=New+Resource",
  pdf_url: "",
  article_url: "",
  summary: "",
  created_at: new Date().toISOString().slice(0, 10),
  published_date: new Date().toISOString().slice(0, 10),
  is_pinned: false,
  is_visible: true,
};

export default function Resources() {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [activeTab, setActiveTab] = useState<ResourceType>("guideline");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(
    null
  );
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const tabResources = resources.filter((item) => item.type === activeTab);

  const categories = useMemo(() => {
    return Array.from(new Set(tabResources.map((item) => item.category)));
  }, [tabResources]);

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return [...tabResources]
      .filter((item) => {
        const matchesSearch =
          item.id.toLowerCase().includes(normalizedSearch) ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.category.toLowerCase().includes(normalizedSearch) ||
          item.related_products.join(" ").toLowerCase().includes(normalizedSearch);

        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1;
        }

        const dateA = new Date(getResourceDate(a)).getTime();
        const dateB = new Date(getResourceDate(b)).getTime();

        if (sortBy === "newest") return dateB - dateA;
        if (sortBy === "oldest") return dateA - dateB;
        if (sortBy === "title") return a.title.localeCompare(b.title);

        return 0;
      });
  }, [tabResources, searchTerm, categoryFilter, sortBy]);

  const handleAddResource = () => {
    const prefix = activeTab === "guideline" ? "TG" : "NEWS";
    const nextNumber =
      resources.filter((item) => item.type === activeTab).length + 1;

    setEditingResource({
      ...emptyResource,
      type: activeTab,
      id: `${prefix}-${String(nextNumber).padStart(3, "0")}`,
      category: activeTab === "guideline" ? "Technical Guideline" : "Company News",
      pdf_url: activeTab === "guideline" ? "" : undefined,
      article_url: activeTab === "news" ? "" : undefined,
    });
  };

  const handleSaveResource = (updatedResource: ResourceItem) => {
    setResources((currentResources) => {
      const exists = currentResources.some(
        (item) => item.id === updatedResource.id
      );

      if (exists) {
        return currentResources.map((item) =>
          item.id === updatedResource.id ? updatedResource : item
        );
      }

      return [...currentResources, updatedResource];
    });

    setEditingResource(null);
  };

  const handleTogglePin = (id: string) => {
    setResources((currentResources) =>
      currentResources.map((item) =>
        item.id === id ? { ...item, is_pinned: !item.is_pinned } : item
      )
    );
    setMenuOpenId(null);
  };

  const handleToggleVisible = (id: string) => {
    setResources((currentResources) =>
      currentResources.map((item) =>
        item.id === id ? { ...item, is_visible: !item.is_visible } : item
      )
    );
    setMenuOpenId(null);
  };

  const handleDeleteResource = (id: string) => {
    setResources((currentResources) =>
      currentResources.filter((item) => item.id !== id)
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
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ marginBottom: 8 }}>Resources</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Manage retailer-facing technical guidelines and BM news resources.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={handleAddResource}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} />
            Add Resource
          </button>
        </div>

        <div
          style={{
            display: "inline-flex",
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <TabButton
            active={activeTab === "guideline"}
            onClick={() => {
              setActiveTab("guideline");
              setCategoryFilter("all");
            }}
            icon={<FileText size={17} />}
            label="Technical Guidelines"
          />

          <TabButton
            active={activeTab === "news"}
            onClick={() => {
              setActiveTab("news");
              setCategoryFilter("all");
            }}
            icon={<Newspaper size={17} />}
            label="News"
          />
        </div>

        <div
          className="card"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
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
              placeholder="Search title, category, product, or ID..."
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
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            style={selectStyle}
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        <p style={{ color: "var(--text-muted)", marginTop: 18 }}>
          Showing <strong>{filteredResources.length}</strong>{" "}
          {activeTab === "guideline" ? "technical guideline" : "news item"}
          {filteredResources.length === 1 ? "" : "s"}
        </p>

        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          {filteredResources.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr auto",
                gap: 20,
                alignItems: "center",
                opacity: item.is_visible ? 1 : 0.55,
                position: "relative",
              }}
            >
              <img
                src={item.thumbnail_url}
                alt={item.title}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 16,
                }}
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <Badge label={item.id} type="blue" />
                  <Badge label={item.category} type="sky" />
                  {item.is_pinned && <Badge label="Pinned" type="green" />}
                  {!item.is_visible && <Badge label="Hidden" type="gray" />}
                </div>

                <h2 style={{ margin: "0 0 8px" }}>{item.title}</h2>

                <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {item.summary}
                </p>

                <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                  <strong>Related Products:</strong>{" "}
                  {item.related_products.join(", ")}
                </p>

                <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  <strong>
                    {item.type === "guideline" ? "Created:" : "Published:"}
                  </strong>{" "}
                  {getResourceDate(item)}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  position: "relative",
                }}
              >
                <a
                  href={item.type === "guideline" ? item.pdf_url : item.article_url}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={16} />
                  Open
                </a>

                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === item.id ? null : item.id)
                  }
                  style={iconButtonStyle}
                >
                  <MoreVertical size={22} />
                </button>

                {menuOpenId === item.id && (
                  <div style={menuStyle}>
                    <button
                      style={menuButtonStyle}
                      onClick={() => {
                        setEditingResource(item);
                        setMenuOpenId(null);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      style={menuButtonStyle}
                      onClick={() => handleTogglePin(item.id)}
                    >
                      {item.is_pinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                      style={menuButtonStyle}
                      onClick={() => handleToggleVisible(item.id)}
                    >
                      {item.is_visible ? "Hide" : "Show"}
                    </button>

                    <button
                      style={{
                        ...menuButtonStyle,
                        color: "var(--ingredients-red)",
                      }}
                      onClick={() => handleDeleteResource(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {editingResource && (
          <ResourceModal
            resource={editingResource}
            onClose={() => setEditingResource(null)}
            onSave={handleSaveResource}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ResourceModal({
  resource,
  onClose,
  onSave,
}: {
  resource: ResourceItem;
  onClose: () => void;
  onSave: (resource: ResourceItem) => void;
}) {
  const [draft, setDraft] = useState<ResourceItem>(resource);
  const [relatedProductsText, setRelatedProductsText] = useState(
    resource.related_products.join(", ")
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSave({
      ...draft,
      related_products: relatedProductsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          width: "min(780px, 100%)",
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
              {resource.title ? "Edit Resource" : "Add Resource"}
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              Add or edit retailer-facing guidelines and news.
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
          <FormField label="Resource Type">
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  type: event.target.value as ResourceType,
                  pdf_url:
                    event.target.value === "guideline" ? draft.pdf_url ?? "" : undefined,
                  article_url:
                    event.target.value === "news" ? draft.article_url ?? "" : undefined,
                })
              }
              style={inputStyle}
            >
              <option value="guideline">Technical Guideline</option>
              <option value="news">News</option>
            </select>
          </FormField>

          <FormField label="Resource ID">
            <input
              value={draft.id}
              onChange={(event) => setDraft({ ...draft, id: event.target.value })}
              style={inputStyle}
            />
          </FormField>

          <FormField label="Title">
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              style={inputStyle}
              required
            />
          </FormField>

          <FormField label="Category">
            <input
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Related Products">
            <input
              value={relatedProductsText}
              onChange={(event) => setRelatedProductsText(event.target.value)}
              style={inputStyle}
              placeholder="Entec Premium, Nitrophoska Durian"
            />
          </FormField>

          <FormField
            label={draft.type === "guideline" ? "Created Date" : "Published Date"}
          >
            <input
              type="date"
              value={
                draft.type === "guideline"
                  ? draft.created_at ?? ""
                  : draft.published_date ?? ""
              }
              onChange={(event) =>
                draft.type === "guideline"
                  ? setDraft({ ...draft, created_at: event.target.value })
                  : setDraft({ ...draft, published_date: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="Thumbnail URL">
          <input
            value={draft.thumbnail_url}
            onChange={(event) =>
              setDraft({ ...draft, thumbnail_url: event.target.value })
            }
            style={inputStyle}
          />
        </FormField>

        {draft.type === "guideline" ? (
          <FormField label="PDF Link">
            <input
              value={draft.pdf_url ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, pdf_url: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>
        ) : (
          <FormField label="Article Link">
            <input
              value={draft.article_url ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, article_url: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>
        )}

        <FormField label="Summary / Description">
          <textarea
            value={draft.summary}
            onChange={(event) =>
              setDraft({ ...draft, summary: event.target.value })
            }
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
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
            Save Resource
          </button>
        </div>
      </form>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: active ? "var(--bm-blue)" : "transparent",
        color: active ? "white" : "var(--bm-blue)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontWeight: 800,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({
  label,
  type,
}: {
  label: string;
  type: "blue" | "sky" | "green" | "gray";
}) {
  const styles = {
    blue: {
      background: "rgba(6, 53, 122, 0.9)",
      color: "white",
    },
    sky: {
      background: "rgba(103, 153, 200, 0.18)",
      color: "var(--bm-blue)",
    },
    green: {
      background: "rgba(122, 193, 67, 0.18)",
      color: "#2f7d32",
    },
    gray: {
      background: "rgba(128, 127, 131, 0.16)",
      color: "var(--bm-gray)",
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

function getResourceDate(item: ResourceItem) {
  return item.type === "guideline"
    ? item.created_at ?? ""
    : item.published_date ?? "";
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
  top: 42,
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