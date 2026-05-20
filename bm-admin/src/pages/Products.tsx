import { useMemo, useState } from "react";
import { Eye, Filter, MoreVertical, Search, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { products as productData } from "../data/adminMockData";

type SortOption = "id" | "name" | "points";
type Product = (typeof productData)[number];

export default function Products() {
  const [products, setProducts] = useState(productData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category_group)));
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.brand)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return [...products]
      .filter((product) => {
        const matchesSearch =
          product.product_name.toLowerCase().includes(normalizedSearch) ||
          product.brand.toLowerCase().includes(normalizedSearch) ||
          product.category.toLowerCase().includes(normalizedSearch) ||
          product.category_group.toLowerCase().includes(normalizedSearch);

        const matchesCategory =
          categoryFilter === "all" || product.category_group === categoryFilter;

        const matchesBrand = brandFilter === "all" || product.brand === brandFilter;

        return matchesSearch && matchesCategory && matchesBrand;
      })
      .sort((a, b) => {
        if (sortBy === "id") {
          return a.product_id - b.product_id;
        }

        if (sortBy === "name") {
          return a.product_name.localeCompare(b.product_name);
        }

        if (sortBy === "points") {
          return b.point_factor - a.point_factor;
        }

        return 0;
      });
  }, [products, searchTerm, categoryFilter, brandFilter, sortBy]);

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.product_id === updatedProduct.product_id ? updatedProduct : product
      )
    );

    setEditingProduct(null);
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
            <h1 style={{ marginBottom: 8 }}>Products</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Manage BM AgriCare product information, categories, descriptions,
              and point factors.
            </p>
          </div>

          <button
            onClick={() => setPreviewMode((current) => !current)}
            className={previewMode ? "green-btn" : "secondary-btn"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <Eye size={18} />
            {previewMode ? "Admin View" : "Retailer View"}
          </button>
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
              placeholder="Search product, brand, or category..."
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
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            style={selectStyle}
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            style={selectStyle}
          >
            <option value="id">Sort by Product ID</option>
            <option value="name">Sort by Name</option>
            <option value="points">Sort by Point Factor</option>
          </select>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ margin: 0 }}>
            Showing <strong>{filteredProducts.length}</strong> product
            {filteredProducts.length === 1 ? "" : "s"}
          </p>

          <p style={{ margin: 0 }}>
            <Filter size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Filters affect admin preview only for now.
          </p>
        </div>

        {previewMode ? (
          <RetailerProductPreview products={filteredProducts} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 24,
            }}
          >
            {filteredProducts.map((product) => (
              <div className="card" key={product.product_id} style={{ padding: 0 }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderTopLeftRadius: "var(--radius-lg)",
                      borderTopRightRadius: "var(--radius-lg)",
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: categoryColor(product.category_group).background,
                      color: categoryColor(product.category_group).color,
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {product.category_group}
                  </span>

                  {product.is_seasonal && (
                    <span
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        background: "rgba(251, 176, 52, 0.9)",
                        color: "#3b2500",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      Seasonal
                    </span>
                  )}
                </div>

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
                      <p style={{ margin: 0, color: "var(--text-muted)" }}>
                        Product #{product.product_id} · {product.brand}
                      </p>
                      <h2 style={{ margin: "6px 0" }}>{product.product_name}</h2>
                    </div>

                    <button
                      aria-label="Product options"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "var(--bm-gray)",
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
                    {product.category}
                  </p>

                  <p>
                    <strong>Point Factor:</strong> {product.point_factor} points/unit
                  </p>

                  <p style={{ lineHeight: 1.6 }}>{product.description}</p>

                  <div>
                    <strong>Key Benefits</strong>
                    <ul style={{ paddingLeft: 20 }}>
                      {product.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() => setEditingProduct(product)}
                    style={{ marginTop: 8 }}
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleSaveProduct}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function EditProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [draft, setDraft] = useState<Product>(product);
  const [benefitsText, setBenefitsText] = useState(product.benefits.join("\n"));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSave({
      ...draft,
      benefits: benefitsText
        .split("\n")
        .map((benefit) => benefit.trim())
        .filter(Boolean),
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16, 32, 51, 0.45)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        zIndex: 999,
      }}
    >
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
            <h2 style={{ margin: 0 }}>Edit Product</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              Update product details shown in the admin and retailer preview.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--bm-gray)",
            }}
          >
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
          <FormField label="Product Name">
            <input
              value={draft.product_name}
              onChange={(event) =>
                setDraft({ ...draft, product_name: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Brand">
            <input
              value={draft.brand}
              onChange={(event) =>
                setDraft({ ...draft, brand: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Product Category">
            <input
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Category Group">
            <select
              value={draft.category_group}
              onChange={(event) =>
                setDraft({ ...draft, category_group: event.target.value })
              }
              style={inputStyle}
            >
              <option value="Fertilizer">Fertilizer</option>
              <option value="Soil Health">Soil Health</option>
              <option value="Agricultural Additives">Agricultural Additives</option>
              <option value="Crop Protection">Crop Protection</option>
              <option value="Fertigation Fertilizers">
                Fertigation Fertilizers
              </option>
            </select>
          </FormField>

          <FormField label="Point Factor">
            <input
              type="number"
              value={draft.point_factor}
              onChange={(event) =>
                setDraft({ ...draft, point_factor: Number(event.target.value) })
              }
              style={inputStyle}
            />
          </FormField>

          <FormField label="Image URL">
            <input
              value={draft.image_url}
              onChange={(event) =>
                setDraft({ ...draft, image_url: event.target.value })
              }
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
          />
        </FormField>

        <FormField label="Key Benefits">
          <textarea
            value={benefitsText}
            onChange={(event) => setBenefitsText(event.target.value)}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            placeholder="One benefit per line"
          />
        </FormField>

        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) =>
                setDraft({ ...draft, is_active: event.target.checked })
              }
            />
            Active product
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={draft.is_seasonal}
              onChange={(event) =>
                setDraft({ ...draft, is_seasonal: event.target.checked })
              }
            />
            Seasonal product
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
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}

function RetailerProductPreview({ products }: { products: Product[] }) {
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
          This is how product edits may appear to retailers.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
      >
        {products.map((product) => (
          <div
            key={product.product_id}
            style={{
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(6, 53, 122, 0.08)",
              border: "1px solid rgba(6, 53, 122, 0.06)",
            }}
          >
            <img
              src={product.image_url}
              alt={product.product_name}
              style={{ width: "100%", height: 130, objectFit: "cover" }}
            />

            <div style={{ padding: 16 }}>
              <span
                style={{
                  ...categoryColor(product.category_group),
                  padding: "5px 9px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {product.category_group}
              </span>

              <h3 style={{ margin: "12px 0 6px" }}>{product.product_name}</h3>

              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  fontSize: 14,
                }}
              >
                {product.description.slice(0, 100)}...
              </p>

              <strong style={{ color: "var(--agricare-green)" }}>
                +{product.point_factor} pts/unit
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
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
      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>{label}</span>
      {children}
    </label>
  );
}

function categoryColor(category: string) {
  const colors: Record<string, { background: string; color: string }> = {
    Fertilizer: {
      background: "rgba(122, 193, 67, 0.16)",
      color: "#2f7d32",
    },
    "Soil Health": {
      background: "rgba(103, 153, 200, 0.18)",
      color: "var(--bm-blue)",
    },
    "Agricultural Additives": {
      background: "rgba(251, 176, 52, 0.2)",
      color: "#8a5a00",
    },
    "Crop Protection": {
      background: "rgba(227, 27, 35, 0.11)",
      color: "var(--ingredients-red)",
    },
    "Fertigation Fertilizers": {
      background: "rgba(6, 53, 122, 0.12)",
      color: "var(--bm-blue)",
    },
  };

  return (
    colors[category] ?? {
      background: "rgba(128, 127, 131, 0.12)",
      color: "var(--bm-gray)",
    }
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

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
};