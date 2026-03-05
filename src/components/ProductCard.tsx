import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Flame  } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Variant {
  id: string;
  variant_name?: string;
  name?: string;
  price: number;
  is_default?: boolean;
  isDefault?: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  categoryId?: string;
  name: string;
  description: string;
  image: string;
  isAvailable?: boolean;
  isFeatured: boolean;
  variants: Variant[];
  addons: Addon[];
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { dispatch } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants.find((v) => v.is_default ?? v.isDefault) ||
      product.variants[0]
  );

  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addToCart = () => {
    const variantName =
      selectedVariant.variant_name ?? selectedVariant.name ?? "";

    const addonKey = selectedAddons
      .map((a) => a.id)
      .sort()
      .join("|");

    const itemId = `${product.id}_${selectedVariant.id}_${addonKey}`;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: itemId,
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
        },
        variant: {
          id: selectedVariant.id,
          name: variantName,
          price: Number(selectedVariant.price ?? 0),
        },
        addons: selectedAddons.map((a) => ({
          id: a.id,
          name: a.name,
          price: Number(a.price ?? 0),
        })),
        quantity: 1,
      },
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    toast.success(`${product.name} added to cart!`, {
      description: `${variantName} — ₹${Number(
        selectedVariant.price ?? 0
      )}`,
    });
  };

  const totalPrice =
    Number(selectedVariant.price ?? 0) +
    selectedAddons.reduce((s, a) => s + Number(a.price ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* ⭐ Premium Bestseller Tag */}
{product.isFeatured && (
  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 backdrop-blur-md border border-white/10 shadow-sm">
    <Flame
      className="w-3.5 h-3.5 text-orange-400"
      strokeWidth={2.5}
    />
    Bestseller
  </div>
)}

        {/* VEG badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="w-2 h-2 rounded-full bg-veg" />
          <span className="text-[10px] font-medium">
            VEG
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          {product.name}
        </h3>

        <p className="text-dim text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v) => {
              const variantPrice = Number(v.price ?? 0);
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    selectedVariant.id === v.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {(v.variant_name ?? v.name) + ` ₹${variantPrice}`}
                </button>
              );
            })}
          </div>
        )}

        {product.addons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.addons.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAddon(a)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedAddons.find((sa) => sa.id === a.id)
                    ? "bg-accent/20 text-accent border-accent/50"
                    : "bg-secondary text-dim border-border hover:border-accent/30"
                }`}
              >
                + {a.name} ₹{a.price}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <motion.p
            key={totalPrice}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-xl font-display font-bold text-foreground"
          >
            ₹{totalPrice}
          </motion.p>

          <button
            onClick={addToCart}
            className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-lg transition-all ${
              justAdded
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.97]"
            }`}
          >
            {justAdded ? (
              "Added ✓"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;