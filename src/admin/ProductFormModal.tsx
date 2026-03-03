import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProduct?: any;
}

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

interface Variant {
  variant_name: string;
  price: number;
  is_default: boolean;
}

interface Addon {
  name: string;
  price: number;
}

const ProductFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  existingProduct,
}: Props) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [variants, setVariants] = useState<Variant[]>([
    { variant_name: "", price: 0, is_default: true },
  ]);

  const [addons, setAddons] = useState<Addon[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    category_id: "",
    is_available: true,
    is_featured: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      if (!existingProduct) return;

      const { data: variantData } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", existingProduct.id);

      const { data: addonData } = await supabase
        .from("product_addons")
        .select("*")
        .eq("product_id", existingProduct.id);

      if (variantData && variantData.length > 0) {
        setVariants(variantData);
      }

      if (addonData) {
        setAddons(addonData);
      }

      setForm({
        name: existingProduct.name,
        description: existingProduct.description,
        image_url: existingProduct.image_url,
        category_id: existingProduct.category_id,
        is_available: existingProduct.is_available,
        is_featured: existingProduct.is_featured,
      });
    };

    loadProductData();
  }, [existingProduct]);

  const addVariant = () =>
    setVariants([...variants, { variant_name: "", price: 0, is_default: false }]);

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) =>
    setVariants(variants.filter((_, i) => i !== index));

  const setDefaultVariant = (index: number) =>
    setVariants(
      variants.map((v, i) => ({
        ...v,
        is_default: i === index,
      }))
    );

  const addAddon = () =>
    setAddons([...addons, { name: "", price: 0 }]);

  const updateAddon = (index: number, field: string, value: any) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const removeAddon = (index: number) =>
    setAddons(addons.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.category_id) {
      toast.error("Name & category required");
      return;
    }

    try {
      setLoading(true);

      let productId = existingProduct?.id;

      if (existingProduct) {
        await supabase
          .from("products")
          .update(form)
          .eq("id", existingProduct.id);
      } else {
        const { data } = await supabase
          .from("products")
          .insert([{ ...form, restaurant_id: RESTAURANT_ID }])
          .select()
          .single();

        productId = data.id;
      }

      // Clear old variants & addons if editing
      if (existingProduct) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
        await supabase.from("product_addons").delete().eq("product_id", productId);
      }

      // Insert variants
      await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: productId,
          variant_name: v.variant_name,
          price: v.price,
          is_default: v.is_default,
        }))
      );

      // Insert addons
      if (addons.length > 0) {
        await supabase.from("product_addons").insert(
          addons.map((a) => ({
            product_id: productId,
            name: a.name,
            price: a.price,
          }))
        );
      }

      toast.success(existingProduct ? "Updated" : "Added");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card w-full max-w-3xl p-6 rounded-xl border overflow-y-auto max-h-[90vh]">

        <h2 className="text-xl font-bold mb-4">
          {existingProduct ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <input
            placeholder="Product Name"
            className="w-full px-4 py-3 bg-secondary border rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="w-full px-4 py-3 bg-secondary border rounded-lg"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            placeholder="Cloudinary Image URL"
            className="w-full px-4 py-3 bg-secondary border rounded-lg"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />

          <select
            className="w-full px-4 py-3 bg-secondary border rounded-lg"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* VARIANTS */}
          <div>
            <h3 className="font-bold mb-3">Variants</h3>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-3 mb-2 items-center">
                <input
                  placeholder="Name"
                  value={variant.variant_name}
                  onChange={(e) =>
                    updateVariant(index, "variant_name", e.target.value)
                  }
                  className="px-3 py-2 bg-secondary border rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, "price", Number(e.target.value))
                  }
                  className="px-3 py-2 bg-secondary border rounded-lg"
                />

                <input
                  type="radio"
                  checked={variant.is_default}
                  onChange={() => setDefaultVariant(index)}
                />

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="text-primary text-sm"
            >
              + Add Variant
            </button>
          </div>

          {/* ADDONS */}
          <div>
            <h3 className="font-bold mb-3">Addons</h3>

            {addons.map((addon, index) => (
              <div key={index} className="flex gap-3 mb-2">
                <input
                  placeholder="Addon Name"
                  value={addon.name}
                  onChange={(e) =>
                    updateAddon(index, "name", e.target.value)
                  }
                  className="px-3 py-2 bg-secondary border rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={addon.price}
                  onChange={(e) =>
                    updateAddon(index, "price", Number(e.target.value))
                  }
                  className="px-3 py-2 bg-secondary border rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addAddon}
              className="text-primary text-sm"
            >
              + Add Addon
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary px-4 py-2 rounded-lg text-primary-foreground"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;