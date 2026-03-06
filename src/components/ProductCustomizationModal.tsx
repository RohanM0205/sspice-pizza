import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  variants: Variant[];
  addons: Addon[];
}

interface Props {
  product: Product | null;
  onClose: () => void;
}

const ProductCustomizationModal = ({ product, onClose }: Props) => {
  const { dispatch } = useCart();

  const [variant, setVariant] = useState(
    product?.variants?.[0] || null
  );

  const [addons, setAddons] = useState<Addon[]>([]);

  if (!product) return null;

  const toggleAddon = (addon: Addon) => {
    setAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addToCart = () => {
    if (!variant) return;

    const addonKey = addons.map((a) => a.id).sort().join("|");

    const id = `${product.id}_${variant.id}_${addonKey}`;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
        },
        variant,
        addons,
        quantity: 1,
      },
    });

    toast.success(`${product.name} added to cart`);

    onClose();
  };

  const total =
    (variant?.price ?? 0) +
    addons.reduce((s, a) => s + a.price, 0);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {product.name}
              </h2>

              <button onClick={onClose}>
                <X />
              </button>
            </div>

            <img
              src={product.image}
              className="rounded-lg mb-4"
            />

            {/* Variants */}
            <h3 className="font-semibold mb-2">Choose Size</h3>

            <div className="flex gap-2 flex-wrap mb-4">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={`px-4 py-2 rounded-full border ${
                    variant?.id === v.id
                      ? "bg-primary text-white"
                      : ""
                  }`}
                >
                  {v.name} ₹{v.price}
                </button>
              ))}
            </div>

            {/* Addons */}
            {product.addons.length > 0 && (
              <>
                <h3 className="font-semibold mb-2">
                  Extra Toppings
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {product.addons.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a)}
                      className={`px-3 py-1 rounded-full border ${
                        addons.find((x) => x.id === a.id)
                          ? "bg-accent/30"
                          : ""
                      }`}
                    >
                      + {a.name} ₹{a.price}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={addToCart}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold"
            >
              Add to Cart — ₹{total}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductCustomizationModal;