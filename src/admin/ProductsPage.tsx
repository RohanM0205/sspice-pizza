import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import ProductFormModal from "./ProductFormModal";
import { toast } from "sonner";

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load products");
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) toast.error("Delete failed");
    else {
      toast.success("Deleted");
      fetchProducts();
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-card border border-border rounded-xl p-4"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />

            <h3 className="font-bold">{product.name}</h3>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setEditingProduct(product);
                  setModalOpen(true);
                }}
                className="text-blue-500 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProducts}
        existingProduct={editingProduct}
      />
    </AdminLayout>
  );
};

export default ProductsPage;