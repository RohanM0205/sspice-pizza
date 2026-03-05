import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import AdminProductCard from "./AdminProductCard";
import EditProductModal from "./EditProductModal";
import { toast } from "sonner";
import ProductFormModal from "./ProductFormModal";

const ITEMS_PER_PAGE = 9;

const ProductsPage = () => {

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [page, setPage] = useState(1);

  const fetchProducts = async () => {

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load products");
    else {
      setProducts(data || []);
      setFilteredProducts(data || []);
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id,name")
      .order("name");

    setCategories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {

    let result = [...products];

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category_id === categoryFilter);
    }

    if (availabilityFilter !== "all") {
      result = result.filter(
        (p) => p.is_available === (availabilityFilter === "available")
      );
    }

    if (featuredFilter !== "all") {
      result = result.filter(
        (p) => p.is_featured === (featuredFilter === "featured")
      );
    }

    setFilteredProducts(result);
    setPage(1);

  }, [search, categoryFilter, availabilityFilter, featuredFilter, products]);

  const deleteProduct = async (id: string) => {

    if (!confirm("Delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) toast.error("Delete failed");
    else {
      toast.success("Product deleted");
      fetchProducts();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
    setFeaturedFilter("all");
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout>

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH + FILTERS */}

      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">

        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 w-64 bg-background"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="all">All Categories</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="all">Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="all">Featured</option>
          <option value="featured">Featured</option>
          <option value="notfeatured">Not Featured</option>
        </select>

        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
        >
          Clear Filters
        </button>

        <div className="text-sm opacity-70 ml-auto">
          {filteredProducts.length} products
        </div>

      </div>

      {/* LOADING */}

      {loading && <p>Loading products...</p>}

      {/* EMPTY STATE */}

      {!loading && paginatedProducts.length === 0 && (
        <div className="text-center py-20 opacity-60">
          No products found
        </div>
      )}

      {/* PRODUCT GRID */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {paginatedProducts.map((product) => (

          <AdminProductCard
            key={product.id}
            product={product}
            onEdit={(p) => {
              setEditingProductId(p.id);
              setEditModalOpen(true);
            }}
            onDelete={deleteProduct}
            onRefresh={fetchProducts}
          />

        ))}

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="flex justify-center gap-3 mt-8">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-3 py-2">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

      {/* ADD PRODUCT MODAL */}

      <ProductFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* EDIT PRODUCT MODAL */}

      <EditProductModal
        productId={editingProductId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchProducts}
      />

    </AdminLayout>
  );
};

export default ProductsPage;