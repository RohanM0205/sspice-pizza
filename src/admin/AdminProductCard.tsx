import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const AdminProductCard = ({
  product,
  onEdit,
  onDelete,
  onRefresh,
}: Props) => {

  const [variants, setVariants] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);

  const fetchDetails = async () => {

    const { data: variantData } = await supabase
      .from("product_variants")
      .select("variant_name, price")
      .eq("product_id", product.id)
      .order("price");

    const { data: addonData } = await supabase
      .from("product_addons")
      .select("name, price")
      .eq("product_id", product.id)
      .order("price");

    setVariants(variantData || []);
    setAddons(addonData || []);
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const toggleAvailability = async () => {
    const { error } = await supabase
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", product.id);

    if (error) toast.error("Failed to update availability");
    else {
      toast.success("Availability updated");
      onRefresh();
    }
  };

  const toggleFeatured = async () => {
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !product.is_featured })
      .eq("id", product.id);

    if (error) toast.error("Failed to update featured status");
    else {
      toast.success("Featured status updated");
      onRefresh();
    }
  };

  const startingPrice =
    variants.length > 0
      ? Math.min(...variants.map(v => v.price))
      : null;

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-200">

      {/* IMAGE */}

      <div className="relative">

        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-40 object-cover"
        />

        {/* HOVER ACTION BAR */}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-sm">

          <button
            onClick={() => onEdit(product)}
            className="px-3 py-1 bg-white/20 backdrop-blur rounded hover:bg-white/30"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="px-3 py-1 bg-red-500/80 rounded hover:bg-red-600"
          >
            Delete
          </button>

        </div>

      </div>

      <div className="p-4">

        {/* TITLE */}

        <h3 className="font-semibold text-lg">
          {product.name}
        </h3>

        {startingPrice && (
          <p className="text-sm font-medium text-primary mt-1">
            Starting from ₹{startingPrice}
          </p>
        )}

        <p className="text-sm opacity-70 mb-3">
          {product.categories?.name}
        </p>

        {/* STATUS BADGES */}

        <div className="flex flex-wrap gap-2 mb-3">

          <span
            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              product.is_available
                ? "bg-green-600/20 text-green-500"
                : "bg-red-600/20 text-red-500"
            }`}
          >
            {product.is_available ? "🟢 Available" : "🔴 Unavailable"}
          </span>

          {product.is_featured && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-600/20 text-yellow-400">
              ⭐ Featured
            </span>
          )}

        </div>

        {/* VARIANTS PREVIEW */}

        {variants.length > 0 && (
          <div className="text-xs mb-2">

            <span className="font-medium opacity-70">Variants:</span>

            <div className="mt-1 flex flex-wrap gap-2">

              {variants.slice(0, 3).map((v, i) => (
                <span
                  key={i}
                  className="bg-muted px-2 py-1 rounded border border-border"
                >
                  {v.variant_name} ₹{v.price}
                </span>
              ))}

              {variants.length > 3 && (
                <span className="opacity-60">
                  +{variants.length - 3} more
                </span>
              )}

            </div>

          </div>
        )}

        {/* ADDONS PREVIEW */}

        {addons.length > 0 && (
          <div className="text-xs mb-4">

            <span className="font-medium opacity-70">Addons:</span>

            <div className="mt-1 flex flex-wrap gap-2">

              {addons.slice(0, 3).map((a, i) => (
                <span
                  key={i}
                  className="bg-muted px-2 py-1 rounded border border-border"
                >
                  {a.name} ₹{a.price}
                </span>
              ))}

              {addons.length > 3 && (
                <span className="opacity-60">
                  +{addons.length - 3} more
                </span>
              )}

            </div>

          </div>
        )}

        {/* QUICK TOGGLES */}

        <div className="flex gap-2 text-xs">

          <button
            onClick={toggleAvailability}
            className="px-3 py-1 rounded border border-border hover:bg-muted transition"
          >
            {product.is_available ? "Disable" : "Enable"}
          </button>

          <button
            onClick={toggleFeatured}
            className="px-3 py-1 rounded border border-border hover:bg-muted transition"
          >
            {product.is_featured ? "Unfeature" : "Feature"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default AdminProductCard;