import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Variant {
  id?: string;
  variant_name: string;
  price: number;
  is_default: boolean;
}

interface Addon {
  id?: string;
  name: string;
  price: number;
}

const EditProductModal = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    category_id: "",
    is_available: true,
    is_featured: false,
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);

  const resetState = () => {
    setForm({
      name: "",
      description: "",
      image_url: "",
      category_id: "",
      is_available: true,
      is_featured: false,
    });

    setVariants([]);
    setAddons([]);
    setImagePreview(null);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    if (!productId) return;

    setLoading(true);

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    const { data: variantData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId);

    const { data: addonData } = await supabase
      .from("product_addons")
      .select("*")
      .eq("product_id", productId);

    if (product) {
      setForm(product);
      setImagePreview(product.image_url);
    }

    if (variantData) setVariants(variantData);
    if (addonData) setAddons(addonData);

    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchCategories();
      fetchProduct();
    }
  }, [isOpen, productId]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setForm({ ...form, image_url: data.secure_url });
    setImagePreview(data.secure_url);
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    uploadImage(file);
  };

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

    if (!productId) return;

    try {
      setLoading(true);

      await supabase
        .from("products")
        .update(form)
        .eq("id", productId);

      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      await supabase
        .from("product_addons")
        .delete()
        .eq("product_id", productId);

      await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: productId,
          variant_name: v.variant_name,
          price: v.price,
          is_default: v.is_default,
        }))
      );

      if (addons.length > 0) {
        await supabase.from("product_addons").insert(
          addons.map((a) => ({
            product_id: productId,
            name: a.name,
            price: a.price,
          }))
        );
      }

      toast.success("Product updated");

      onSuccess();
      onClose();

    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-card w-full max-w-3xl p-6 rounded-xl border overflow-y-auto max-h-[90vh]">

        <h2 className="text-2xl font-bold mb-6">
          Edit Product
        </h2>

        {loading && <p>Loading...</p>}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* IMAGE */}

            <div>
              <p className="font-semibold mb-2">Product Image</p>

              {imagePreview && (
                <img
                  src={imagePreview}
                  className="w-40 rounded mb-2"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* BASIC INFO */}

            <input
              className="w-full px-4 py-3 bg-secondary border rounded-lg"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <textarea
              className="w-full px-4 py-3 bg-secondary border rounded-lg"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <select
              className="w-full px-4 py-3 bg-secondary border rounded-lg"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* TOGGLES */}

            <div className="flex gap-6">

              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_available: e.target.checked,
                    })
                  }
                />
                Available
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_featured: e.target.checked,
                    })
                  }
                />
                Featured
              </label>

            </div>

            {/* VARIANTS */}

            <div>

              <h3 className="font-bold mb-3">Variants</h3>

              {variants.map((variant, index) => (
                <div key={index} className="flex gap-3 mb-2 items-center">

                  <input
                    value={variant.variant_name}
                    onChange={(e) =>
                      updateVariant(index, "variant_name", e.target.value)
                    }
                    className="px-3 py-2 bg-secondary border rounded-lg"
                  />

                  <input
                    type="number"
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
                    value={addon.name}
                    onChange={(e) =>
                      updateAddon(index, "name", e.target.value)
                    }
                    className="px-3 py-2 bg-secondary border rounded-lg"
                  />

                  <input
                    type="number"
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
                className="bg-primary px-5 py-2 rounded-lg text-primary-foreground"
              >
                Update Product
              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default EditProductModal;