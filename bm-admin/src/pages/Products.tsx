import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  Search,
  Plus,
  Pencil,
  X,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Info,
  Upload,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductMetrics,
  listAdminProducts,
  setAdminProductActive,
  updateAdminProduct,
  uploadProductImage,
  type AdminProduct,
  type AdminProductPayload,
  type ProductMetrics,
} from "../services/adminProductsApi";
import { useAppPreferences } from "../context/AppPreferencesContext";
import * as XLSX from "xlsx";

type ProductFormState = {
  product_name: string;
  brand: string;
  weight: string;
  formula: string;
  category: string;
  sub_cat: string;
  point_factor: string;
  price: string;
  short_desc: string;
  description: string;
  nutrients: string;
  key_features: string;
  application: string;
  image_url: string;
  brand_image_url: string;
  is_active: boolean;
  is_seasonal: boolean;
};
type SortOption = "default" | "company" | "points" | "seasonal";

const emptyForm: ProductFormState = {
  product_name: "",
  brand: "",
  weight: "",
  formula: "",
  category: "",
  sub_cat: "",
  point_factor: "0",
  price: "0",
  short_desc: "",
  description: "",
  nutrients: "",
  key_features: "",
  application: "",
  image_url: "",
  brand_image_url: "",
  is_active: true,
  is_seasonal: false,
};
const SEASONAL_BAR_COLOR = "#fbb034";
const SEASONAL_BAR_HEIGHT = 12;
const PRODUCT_IMAGE_VERTICAL_OFFSET = -16; // -16;

function formatVnd(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
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

function sentenceCase(value?: string | null) {
  if (!value) return "";

  const clean = value.trim();

  if (!clean) return "";

  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function getProductDescriptionKey(product: AdminProduct) {
  const text = `${product.brand} ${product.product_name}`.toLowerCase();

  if (text.includes("entec")) return "productCopyEntecShortDesc";
  if (text.includes("nitrophoska")) return "productCopyNitrophoskaShortDesc";
  if (text.includes("fertiganic")) return "productCopyFertiganicShortDesc";

  return "";
}

function getProductDescription(
  product: AdminProduct,
  t?: (key: string) => string
) {
  const translatedKey = getProductDescriptionKey(product);

  if (translatedKey && t) {
    const translatedValue = t(translatedKey);

    if (translatedValue && translatedValue !== translatedKey) {
      return translatedValue;
    }
  }

  return (
    product.short_desc ||
    product.description ||
    product.nutrients ||
    "No product description available yet."
  );
}

function getCompanyColor(company?: string | null) {
  const normalized = (company || "").toLowerCase();

  if (normalized.includes("entec")) return "#06357a";
  if (normalized.includes("nitrophoska")) return "#6799c8";
  if (normalized.includes("novatec")) return "#7ac143";
  if (normalized.includes("yuroka")) return "#fbb034";
  if (normalized.includes("fertiganic")) return "#8bbf3d";
  if (normalized.includes("gowin")) return "#807f83";
  if (normalized.includes("growel")) return "#e31b23";

  return "#06357a";
}

function createFormFromProduct(product: AdminProduct): ProductFormState {
  return {
    product_name: product.product_name || "",
    brand: product.brand || product.company || "",
    weight: product.weight || "",
    formula: product.formula || "",
    category: product.category || "",
    sub_cat: product.sub_cat || "",
    point_factor: String(product.point_factor ?? 0),
    price: String(product.price ?? 0),
    short_desc: product.short_desc || "",
    description: product.description || "",
    nutrients: product.nutrients || "",
    key_features: product.key_features || "",
    application: product.application || "",
    image_url: product.image_url || "",
    brand_image_url: product.brand_image_url || "",
    is_active: product.is_active ?? true,
    is_seasonal: product.is_seasonal ?? false,
  };
}

function createPayloadFromForm(form: ProductFormState): AdminProductPayload {
  return {
    product_name: form.product_name.trim(),
    brand: form.brand.trim(),
    company: form.brand.trim(),
    weight: form.weight.trim(),
    formula: form.formula.trim(),
    category_group: "Fertilizer",
    category: form.category.trim(),
    sub_cat: form.sub_cat.trim(),
    point_factor: Number(form.point_factor || 0),
    price: Number(form.price || 0),
    short_desc: form.short_desc.trim(),
    description: form.description.trim(),
    nutrients: form.nutrients.trim(),
    key_features: form.key_features.trim(),
    application: form.application.trim(),
    image_url: form.image_url.trim(),
    brand_image_url: form.brand_image_url.trim(),
    is_active: form.is_active,
    is_seasonal: form.is_seasonal,
  };
}

function validateProductForm(form: ProductFormState) {
  const requiredFields = [
    ["Product Name", form.product_name],
    ["Brand", form.brand],
    ["Formula", form.formula],
    ["Weight", form.weight],
    ["Category", form.category],
    ["Point Factor", form.point_factor],
    ["Product Image", form.image_url],
  ];

  const missingField = requiredFields.find(([, value]) => !String(value).trim());

  if (missingField) {
    throw new Error(`${missingField[0]} is required.`);
  }
}

function productSortRank(product: AdminProduct) {
  if (!product.is_active) return 3;
  if (product.is_seasonal) return 1;
  return 2;
}

export default function Products() {
  const { t } = useAppPreferences();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(
    null
  );
  const [detailProduct, setDetailProduct] = useState<ProductMetrics | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [deleteCandidate, setDeleteCandidate] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await listAdminProducts({ includeInactive });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.brand).filter(Boolean))
    ).sort();
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category || "Uncategorized"))
    ).sort();
  }, [products]);

  const seasonalBrands = useMemo(() => {
    return new Set(
      products
        .filter((product) => product.is_active && product.is_seasonal)
        .map((product) => product.brand)
    );
  }, [products]);
  
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
  
    return products
      .filter((product) => {
        const matchesSearch =
          !cleanSearch ||
          product.product_name.toLowerCase().includes(cleanSearch) ||
          product.brand.toLowerCase().includes(cleanSearch) ||
          (product.formula || "").toLowerCase().includes(cleanSearch) ||
          (product.category || "").toLowerCase().includes(cleanSearch) ||
          (product.description || "").toLowerCase().includes(cleanSearch);
  
        const matchesBrand =
          brandFilter === "all" || product.brand === brandFilter;
  
        const matchesCategory =
          categoryFilter === "all" ||
          (product.category || "Uncategorized") === categoryFilter;
  
        return matchesSearch && matchesBrand && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "company") {
          return (
            a.brand.localeCompare(b.brand) ||
            productSortRank(a) - productSortRank(b) ||
            a.product_name.localeCompare(b.product_name)
          );
        }
  
        if (sortBy === "points") {
          return (
            Number(b.point_factor || 0) - Number(a.point_factor || 0) ||
            a.brand.localeCompare(b.brand) ||
            a.product_name.localeCompare(b.product_name)
          );
        }
  
        if (sortBy === "seasonal") {
          return (
            productSortRank(a) - productSortRank(b) ||
            a.brand.localeCompare(b.brand) ||
            a.product_name.localeCompare(b.product_name)
          );
        }
  
        const aCompanyHasSeasonal = seasonalBrands.has(a.brand) ? 0 : 1;
        const bCompanyHasSeasonal = seasonalBrands.has(b.brand) ? 0 : 1;
  
        return (
          aCompanyHasSeasonal - bCompanyHasSeasonal ||
          a.brand.localeCompare(b.brand) ||
          productSortRank(a) - productSortRank(b) ||
          a.product_name.localeCompare(b.product_name)
        );
      });
  }, [
    products,
    searchTerm,
    brandFilter,
    categoryFilter,
    sortBy,
    seasonalBrands,
  ]);
  const summary = useMemo(() => {
    return {
      totalProducts: products.length,
      activeProducts: products.filter((product) => product.is_active).length,
      hiddenProducts: products.filter((product) => !product.is_active).length,
      brands: brands.length,
      seasonal: products.filter((product) => product.is_seasonal).length,
    };
  }, [products, brands]);

  function updateForm<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateDrawer() {
    setMode("create");
    setSelectedProduct(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    setError("");
    setSuccessMessage("");
  }

  function openEditDrawer(product: AdminProduct) {
    setMode("edit");
    setSelectedProduct(product);
    setForm(createFormFromProduct(product));
    setDrawerOpen(true);
    setOpenMenuProductId(null);
    setError("");
    setSuccessMessage("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedProduct(null);
    setForm(emptyForm);
  }

  async function openProductDetails(product: AdminProduct) {
    setDetailLoading(true);
    setOpenMenuProductId(null);
    setError("");

    try {
      const data = await getAdminProductMetrics(product.product_id);
      setDetailProduct(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load product details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSaveProduct() {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      validateProductForm(form);

      const payload = createPayloadFromForm(form);

      if (mode === "edit" && selectedProduct) {
        await updateAdminProduct(selectedProduct.product_id, payload);
        setSuccessMessage("Product updated successfully.");
      } else {
        await createAdminProduct(payload);
        setSuccessMessage("Product created successfully.");
      }

      closeDrawer();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(product: AdminProduct) {
    setError("");
    setSuccessMessage("");
    setOpenMenuProductId(null);

    try {
      await setAdminProductActive(product.product_id, !product.is_active);
      setSuccessMessage(
        product.is_active
          ? "Product hidden from retailer and TCE interfaces."
          : "Product restored for retailer and TCE interfaces."
      );
      await loadProducts();

      if (detailProduct?.product.product_id === product.product_id) {
        setDetailProduct(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update product status."
      );
    }
  }

  function requestDeleteProduct(product: AdminProduct) {
    setOpenMenuProductId(null);
    setDeleteCandidate(product);
  }
  
  async function confirmDeleteProduct() {
    if (!deleteCandidate) return;
  
    setDeleting(true);
    setError("");
    setSuccessMessage("");
  
    try {
      await deleteAdminProduct(deleteCandidate.product_id);
      setSuccessMessage("Product permanently removed.");
      setDetailProduct(null);
      setDeleteCandidate(null);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove product. Hide it instead if it is used by invoices or rewards."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleUploadImage(file: File) {
    setUploadingImage(true);
    setError("");

    try {
      const uploaded = await uploadProductImage(file);
      updateForm("image_url", uploaded.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleExportProductsExcel() {
    setError("");
    setSuccessMessage("");
  
    try {
      const metricsList = await Promise.all(
        products.map((product) => getAdminProductMetrics(product.product_id))
      );
  
      const rows = metricsList.map((metrics) => {
        const product = metrics.product;
  
        return {
          "Product Name": product.product_name,
          Company: product.brand,
          Formula: product.formula || "",
          Weight: product.weight || "",
          Category: product.category || "",
          Subcategory: product.sub_cat || "",
          "Point Factor": product.point_factor,
          "Price VND": product.price || "",
          "Short Description": product.short_desc || "",
          Description: product.description || "",
          Nutrients: product.nutrients || "",
          "Key Features": product.key_features || "",
          Application: product.application || "",
          "Image URL": product.image_url || "",
          "Brand Image URL": product.brand_image_url || "",
          Active: product.is_active ? "Yes" : "No",
          Hidden: product.is_active ? "No" : "Yes",
          Seasonal: product.is_seasonal ? "Yes" : "No",
          "Appeared In Invoices": metrics.summary.invoice_count || 0,
          "Units Sold": metrics.summary.units_sold || 0,
          "Points Issued": metrics.summary.points_issued || 0,
          "Total Sales VND": metrics.summary.total_sales || 0,
        };
      });
  
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
  
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
      XLSX.writeFile(workbook, "bm-admin-products-export.xlsx");
  
      setSuccessMessage("Product export created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to export products.");
    }
  }

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div style={pageHeaderStyle}>
          <div>
            <h1>{t("products") || "Products"}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              Manage product catalog information, product images, point factors,
              and descriptions synced with Postgres.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="secondary-btn" onClick={handleExportProductsExcel}>
              Export Excel
            </button>

            <button className="primary-btn" onClick={openCreateDrawer}>
              <Plus size={17} />
              Add Product
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatBox title="Total Products" value={summary.totalProducts} />
          <StatBox title="Active Products" value={summary.activeProducts} />
          <StatBox title="Hidden Products" value={summary.hiddenProducts} />
          <StatBox title="Seasonal" value={summary.seasonal} />
        </div>

        <div className="card" style={filtersCardStyle}>
          <div style={searchBoxStyle}>
            <Search size={18} color="var(--text-muted)" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search product name, brand, formula, category..."
              style={searchInputStyle}
            />
          </div>

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
            <option value="default">Default Sort</option>
            <option value="company">Sort by Company</option>
            <option value="points">Sort by Point Factor</option>
            <option value="seasonal">Sort by Seasonal</option>
          </select>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Show hidden
          </label>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        {successMessage && <div style={successBoxStyle}>{successMessage}</div>}

        {loading && (
          <div className="card" style={{ marginTop: 24 }}>
            Loading products from Postgres...
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            No products found.
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div style={productGridStyle}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                t={t}
                menuOpen={openMenuProductId === product.product_id}
                onOpenMenu={() =>
                  setOpenMenuProductId((current) =>
                    current === product.product_id ? null : product.product_id
                  )
                }
                onDetails={() => openProductDetails(product)}
                onEdit={() => openEditDrawer(product)}
                onToggleActive={() => handleToggleActive(product)}
                onDelete={() => requestDeleteProduct(product)}
              />
            ))}
          </div>
        )}

        {drawerOpen && (
          <ProductDrawer
            mode={mode}
            form={form}
            saving={saving}
            uploadingImage={uploadingImage}
            onUpdate={updateForm}
            onUploadImage={handleUploadImage}
            onClose={closeDrawer}
            onSave={handleSaveProduct}
          />
        )}

        {detailLoading && (
          <div style={modalOverlayStyle}>
            <div style={detailModalStyle}>
              <p style={{ color: "var(--text-muted)", fontWeight: 800 }}>
                Loading product details...
              </p>
            </div>
          </div>
        )}

        {detailProduct && (
          <ProductDetailModal
            metrics={detailProduct}
            t={t}
            onClose={() => setDetailProduct(null)}
            onEdit={() => {
              setDetailProduct(null);
              openEditDrawer(detailProduct.product);
            }}
            onToggleActive={() => handleToggleActive(detailProduct.product)}
            onDelete={() => requestDeleteProduct(detailProduct.product)}
          />
        )}
        {deleteCandidate && (
          <ConfirmRemoveProductModal
            product={deleteCandidate}
            deleting={deleting}
            onCancel={() => setDeleteCandidate(null)}
            onConfirm={confirmDeleteProduct}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ProductCard({
  product,
  t,
  menuOpen,
  onOpenMenu,
  onDetails,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  product: AdminProduct;
  t: (key: string) => string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const imageSrc = getImageSrc(product.image_url);
  const companyColor = getCompanyColor(product.brand);

  return (
    <article
      className="card"
      onClick={onDetails}
      style={{
        ...compactProductCardStyle,
        opacity: product.is_active ? 1 : 0.72,
      }}
    >
      {product.is_seasonal && <div style={seasonalTopBarStyle} />}
      <div style={compactCardHeaderStyle}>
        <span
          style={{
            ...companyBadgeStyle,
            background: companyColor,
          }}
        >
          {product.brand}
        </span>

        <button
          type="button"
          aria-label="Product actions"
          onClick={(event) => {
            event.stopPropagation();
            onOpenMenu();
          }}
          style={iconButtonStyle}
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div
            style={kebabMenuStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <button style={menuItemStyle} onClick={onDetails}>
              <Info size={15} />
              Details
            </button>

            <button style={menuItemStyle} onClick={onEdit}>
              <Pencil size={15} />
              Edit
            </button>

            <button style={menuItemStyle} onClick={onToggleActive}>
              {product.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
              {product.is_active ? "Hide" : "Unhide"}
            </button>

            <button
              style={{ ...menuItemStyle, color: "var(--danger-text)" }}
              onClick={onDelete}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        )}
      </div>

      <div style={compactProductBodyStyle}>
      <div style={thumbnailColumnStyle}>
          <div style={compactImageFrameStyle}>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.product_name}
                style={compactProductImageStyle}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div style={imageFallbackStyle}>{product.brand}</div>
            )}
          </div>

          <div style={pointFactorInlineStyle}>
            <span>Point Factor</span>
            <strong
              style={{
                ...pointFactorValueStyle,
                background: companyColor,
              }}
            >
              {product.point_factor}
            </strong>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <h2 style={productTitleStyle}>{product.product_name}</h2>

          <p style={compositionStyle}>
            {product.formula || "Formula not listed"} · {product.weight || "—"}
          </p>

          <p style={normalDescriptionStyle}>
            {sentenceCase(getProductDescription(product, t))}
          </p>

          {product.nutrients && (
            <p style={nutrientLineStyle}>
              <strong>Nutrients:</strong> {sentenceCase(product.nutrients)}
            </p>
          )}
        </div>
      </div>

      

      <div style={statusLabelRowStyle}>
        {product.is_seasonal && (
          <span style={seasonalSoftLabelStyle}>Seasonal</span>
        )}

        {!product.is_active && (
          <span style={hiddenLabelStyle}>
            <EyeOff size={13} />
            Hidden
          </span>
        )}
      </div>
    </article>
  );
}

function ProductDrawer({
  mode,
  form,
  saving,
  uploadingImage,
  onUpdate,
  onUploadImage,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  form: ProductFormState;
  saving: boolean;
  uploadingImage: boolean;
  onUpdate: <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) => void;
  onUploadImage: (file: File) => Promise<void>;
  onClose: () => void;
  onSave: () => void;
}) {
  const previewSrc = getImageSrc(form.image_url);

  return (
    <div style={drawerOverlayStyle}>
      <div style={drawerStyle}>
        <div style={drawerHeaderStyle}>
          <div>
            <p style={mutedSmallTextStyle}>
              {mode === "edit" ? "Edit Product" : "New Product"}
            </p>
            <h2 style={{ margin: "4px 0 0" }}>
              {mode === "edit" ? form.product_name : "Add Product"}
            </h2>
          </div>

          <button className="secondary-btn" onClick={onClose}>
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
              <img
                src={previewSrc}
                alt="Product preview"
                style={previewImageStyle}
              />
            ) : (
              <span style={uploadPromptStyle}>
                <Upload size={18} />
                {uploadingImage
                  ? "Uploading image..."
                  : "Click to upload product image"}
              </span>
            )}
          </label>

          <FormField
            label="Product Name"
            required
            value={form.product_name}
            placeholder="Example: Entec 20-10-10"
            onChange={(value) => onUpdate("product_name", value)}
          />

          <div style={twoColumnStyle}>
            <FormField
              label="Brand"
              required
              value={form.brand}
              placeholder="Example: Entec, Nitrophoska, NovaTec"
              onChange={(value) => onUpdate("brand", value)}
            />

            <FormField
              label="Formula"
              required
              value={form.formula}
              placeholder="Example: 20-10-10"
              onChange={(value) => onUpdate("formula", value)}
            />
          </div>

          <div style={twoColumnStyle}>
            <FormField
              label="Weight"
              required
              value={form.weight}
              placeholder="25KG, 50KG"
              onChange={(value) => onUpdate("weight", value)}
            />

            <FormField
              label="Category"
              required
              value={form.category}
              placeholder="Fertilizer, Soil Health"
              onChange={(value) => onUpdate("category", value)}
            />
          </div>

          <div style={twoColumnStyle}>
            <FormField
              label="Subcategory"
              optional
              value={form.sub_cat}
              placeholder="Compound fertilizer, specialty fertilizer"
              onChange={(value) => onUpdate("sub_cat", value)}
            />

            <FormField
              label="Point Factor"
              required
              value={form.point_factor}
              type="number"
              placeholder="Example: 25"
              onChange={(value) => onUpdate("point_factor", value)}
            />
          </div>

          <div style={twoColumnStyle}>
            <FormField
              label="Price"
              optional
              value={form.price}
              type="number"
              placeholder="Example: 1200000"
              onChange={(value) => onUpdate("price", value)}
            />

            <FormField
              label="Product Image URL"
              required
              value={form.image_url}
              placeholder="/product-images/entec-20-10-10.png"
              onChange={(value) => onUpdate("image_url", value)}
            />
          </div>

          <FormField
            label="Brand Image URL"
            optional
            value={form.brand_image_url}
            placeholder="/product-images/entec-brand.png"
            onChange={(value) => onUpdate("brand_image_url", value)}
          />

          <TextAreaField
            label="Short Description"
            optional
            value={form.short_desc}
            placeholder="Short product summary shown on product cards."
            onChange={(value) => onUpdate("short_desc", value)}
          />

          <TextAreaField
            label="Full Description"
            optional
            value={form.description}
            placeholder="Longer product description."
            onChange={(value) => onUpdate("description", value)}
          />

          <TextAreaField
            label="Nutrients"
            optional
            value={form.nutrients}
            placeholder="Example: Nitrogen, phosphorus, potassium."
            onChange={(value) => onUpdate("nutrients", value)}
          />

          <TextAreaField
            label="Key Features"
            optional
            value={form.key_features}
            placeholder="Example: Supports root growth, improves yield."
            onChange={(value) => onUpdate("key_features", value)}
          />

          <TextAreaField
            label="Application"
            optional
            value={form.application}
            placeholder="How retailers or farmers should apply the product."
            onChange={(value) => onUpdate("application", value)}
          />

          <div style={twoColumnStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => onUpdate("is_active", event.target.checked)}
              />
              Active in retailer/TCE interfaces
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.is_seasonal}
                onChange={(event) =>
                  onUpdate("is_seasonal", event.target.checked)
                }
              />
              Seasonal product
            </label>
          </div>
        </div>

        <div style={drawerFooterStyle}>
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="primary-btn" disabled={saving} onClick={onSave}>
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({
  metrics,
  t,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  metrics: ProductMetrics;
  t: (key: string) => string;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const product = metrics.product;
  const imageSrc = getImageSrc(product.image_url);
  const companyColor = getCompanyColor(product.brand);
  const maxUnits = Math.max(
    ...metrics.monthlyUnits.map((point) => Number(point.units_sold || 0)),
    1
  );

  return (
    <div style={modalOverlayStyle}>
      <div style={detailModalStyle}>
        <div style={detailHeaderStyle}>
          <div>
            <p style={mutedSmallTextStyle}>Product Details</p>
            <h2 style={{ margin: "4px 0 0" }}>{product.product_name}</h2>
          </div>

          <button className="secondary-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={detailBodyStyle}>
          <div style={detailProductHeroStyle}>
            <div style={detailImageBoxStyle}>
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={product.product_name}
                  style={previewImageStyle}
                />
              ) : (
                <div style={imageFallbackStyle}>{product.brand}</div>
              )}
            </div>

            <div>
              <span
                style={{
                  ...companyBadgeStyle,
                  background: companyColor,
                }}
              >
                {product.brand}
              </span>

              {!product.is_active && (
                <span style={{ ...hiddenLabelStyle, marginLeft: 8 }}>
                  <EyeOff size={13} />
                  Hidden
                </span>
              )}

              {product.is_seasonal && (
                <span style={{ ...seasonalSoftLabelStyle, marginLeft: 8 }}>
                  Seasonal
                </span>
              )}

              <h3 style={{ marginBottom: 6 }}>{product.formula}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                {sentenceCase(getProductDescription(product, t))}
              </p>

              {product.nutrients && (
                <p style={{ lineHeight: 1.6 }}>
                  <strong>Nutrients:</strong> {sentenceCase(product.nutrients)}
                </p>
              )}
            </div>
          </div>

          <div style={detailStatsGridStyle}>
            <MiniMetric
              label="Units Sold"
              value={Number(metrics.summary.units_sold || 0).toLocaleString()}
            />

            <MiniMetric
              label="Appeared In"
              value={`${Number(metrics.summary.invoice_count || 0)} invoices`}
            />

            <MiniMetric
              label="Points Issued"
              value={Number(metrics.summary.points_issued || 0).toLocaleString()}
            />

            {Number(product.price || 0) > 0 && (
              <MiniMetric label="Optional Price" value={formatVnd(product.price)} />
            )}
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Monthly Units Submitted</h3>

            {metrics.monthlyUnits.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                No invoice units recorded for this product yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {metrics.monthlyUnits.map((point) => {
                  const units = Number(point.units_sold || 0);
                  const width = `${Math.max(8, (units / maxUnits) * 100)}%`;

                  return (
                    <div key={point.month}>
                      <div style={salesBarLabelStyle}>
                        <span>{point.month}</span>
                        <strong>
                          {units.toLocaleString()} units ·{" "}
                          {Number(point.invoice_count || 0)} invoices
                        </strong>
                      </div>

                      <div style={salesBarTrackStyle}>
                        <div
                          style={{
                            ...salesBarFillStyle,
                            width,
                            background: SEASONAL_BAR_COLOR,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={detailFooterStyle}>
          <button className="secondary-btn" onClick={onEdit}>
            <Pencil size={15} />
            Edit
          </button>

          <button className="secondary-btn" onClick={onToggleActive}>
            {product.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
            {product.is_active ? "Hide" : "Unhide"}
          </button>

          <button className="secondary-btn" onClick={onDelete}>
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRemoveProductModal({
  product,
  deleting,
  onCancel,
  onConfirm,
}: {
  product: AdminProduct;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div style={modalOverlayStyle}>
      <div style={confirmModalStyle}>
        <div style={confirmIconStyle}>
          <Trash2 size={24} />
        </div>

        <h2 style={{ margin: "16px 0 8px" }}>Remove product?</h2>

        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginTop: 0 }}>
          This will permanently remove{" "}
          <strong style={{ color: "var(--text-main)" }}>
            {product.product_name}
          </strong>{" "}
          from the database. This action cannot be recovered. You will need to
          create a new product card to add this product back.
        </p>

        <div style={confirmProductBoxStyle}>
          <strong>{product.product_name}</strong>
          <span style={{ color: "var(--text-muted)" }}>
            {product.brand} · {product.formula || "No formula listed"}
          </span>
        </div>

        <div style={confirmActionsStyle}>
          <button className="secondary-btn" onClick={onCancel} disabled={deleting}>
            Cancel
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
            {deleting ? "Removing..." : "Remove Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label style={formLabelStyle}>
      <span>
        {label}
        {required && <span style={{ color: "var(--danger-text)" }}> *</span>}
        {!required && optional && (
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {" "}
            (optional)
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label style={formLabelStyle}>
      <span>
        {label}
        {required && <span style={{ color: "var(--danger-text)" }}> *</span>}
        {!required && optional && (
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {" "}
            (optional)
          </span>
        )}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        style={textareaStyle}
      />
    </label>
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

const pageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
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
  gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
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

const productGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 20,
  marginTop: 24,
};

const compactProductCardStyle: CSSProperties = {
  padding: 0,
  overflow: "visible",
  cursor: "pointer",
  position: "relative",
  minHeight: 310,
  display: "flex",
  flexDirection: "column",
};

const compactCardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px 0",
  position: "relative",
};

const seasonalTopBarStyle: CSSProperties = {
  height: SEASONAL_BAR_HEIGHT,
  background: SEASONAL_BAR_COLOR,
  borderRadius: "18px 18px 0 0",
};

const compactProductBodyStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "112px 1fr",
  gap: 16,
  padding: 16,
  alignItems: "start",
};

const compactImageFrameStyle: CSSProperties = {
  width: 112,
  height: 112,
  borderRadius: 18,
  border: "1px solid var(--border-soft)",
  background:
    "linear-gradient(135deg, rgba(122,193,67,0.10), rgba(103,153,200,0.16))",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
};

const compactProductImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: 10,
  display: "block",
  transform: `translateY(${PRODUCT_IMAGE_VERTICAL_OFFSET}px)`,
};

const productTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.1rem",
  lineHeight: 1.25,
};

const compositionStyle: CSSProperties = {
  margin: "8px 0",
  color: "var(--text-brand-readable)",
  fontWeight: 900,
};

const normalDescriptionStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-muted)",
  lineHeight: 1.5,
  fontSize: "0.9rem",
};

const nutrientLineStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "var(--text-main)",
  lineHeight: 1.45,
  fontSize: "0.86rem",
};

const statusLabelRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  padding: "0 16px 16px",
};

const companyBadgeStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  color: "white",
  fontWeight: 900,
  fontSize: 12,
};

const iconButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const kebabMenuStyle: CSSProperties = {
  position: "absolute",
  top: 48,
  right: 12,
  zIndex: 20,
  minWidth: 160,
  borderRadius: 14,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  boxShadow: "0 16px 34px rgba(16, 24, 40, 0.16)",
  padding: 8,
};

const menuItemStyle: CSSProperties = {
  width: "100%",
  border: 0,
  background: "transparent",
  color: "var(--text-main)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 10px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "left",
};

const imageFallbackStyle: CSSProperties = {
  width: 76,
  height: 76,
  borderRadius: "50%",
  background: "var(--bm-blue)",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  textAlign: "center",
  padding: 8,
  fontSize: 12,
};

const seasonalSoftLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(251, 176, 52, 0.16)",
  color: "#9a6700",
  fontWeight: 900,
  fontSize: 12,
};

const hiddenLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(128, 127, 131, 0.14)",
  color: "var(--text-muted)",
  fontWeight: 900,
  fontSize: 12,
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

const formLabelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  fontWeight: 800,
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: 12,
  background: "var(--bg-card)",
  color: "var(--text-main)",
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

const twoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
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

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.48)",
  zIndex: 120,
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const detailModalStyle: CSSProperties = {
  width: "min(940px, 100%)",
  maxHeight: "90vh",
  overflow: "hidden",
  borderRadius: 22,
  background: "var(--bg-card)",
  color: "var(--text-main)",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
  display: "flex",
  flexDirection: "column",
};

const detailHeaderStyle: CSSProperties = {
  padding: 22,
  borderBottom: "1px solid var(--border-soft)",
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const detailBodyStyle: CSSProperties = {
  padding: 22,
  overflowY: "auto",
};

const detailFooterStyle: CSSProperties = {
  padding: 22,
  borderTop: "1px solid var(--border-soft)",
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};

const detailProductHeroStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  gap: 22,
  alignItems: "center",
};

const detailImageBoxStyle: CSSProperties = {
  height: 220,
  borderRadius: 20,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-soft)",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
};

const detailStatsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
  marginTop: 22,
};

const salesBarLabelStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 6,
  color: "var(--text-muted)",
  fontWeight: 800,
};

const salesBarTrackStyle: CSSProperties = {
  height: 10,
  borderRadius: 999,
  background: "var(--bg-soft)",
  overflow: "hidden",
};

const salesBarFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
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


const thumbnailColumnStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  alignContent: "start",
};

const pointFactorInlineStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: "0.78rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  whiteSpace: "nowrap",
};

const pointFactorValueStyle: CSSProperties = {
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  color: "white",
  display: "inline-grid",
  placeItems: "center",
  padding: "0 9px",
  fontSize: "0.85rem",
};