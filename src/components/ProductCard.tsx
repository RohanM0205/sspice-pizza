import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Product, Variant, Addon } from "@/lib/menu-data";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants.find((v) => v.isDefault) || product.variants[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, variant: selectedVariant, addons: selectedAddons },
    });
    toast.success(`${product.name} added to cart!`, {
      description: `${selectedVariant.name} — ₹${selectedVariant.price}`,
    });
  };

  const totalPrice = selectedVariant.price + selectedAddons.reduce((s, a) => s + a.price, 0);

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
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="w-2 h-2 rounded-full bg-veg" />
          <span className="text-[10px] font-sans font-medium text-foreground">VEG</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">{product.name}</h3>
        <p className="text-dim text-sm font-sans mb-3 line-clamp-2">{product.description}</p>

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`text-xs font-sans font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selectedVariant.id === v.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Addons */}
        {product.addons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.addons.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAddon(a)}
                className={`text-xs font-sans px-2.5 py-1 rounded-full border transition-all ${
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
          <p className="text-xl font-display font-bold text-foreground">
            ₹{totalPrice}
          </p>
          <button
            onClick={addToCart}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-sans font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
