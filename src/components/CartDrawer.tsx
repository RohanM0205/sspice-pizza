import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CartDrawer = () => {
  const { state, dispatch, totalAmount, totalItems, deliveryCharge } =
    useCart();

  const navigate = useNavigate();

  const [confirmId, setConfirmId] = useState<string | null>(null);

  /* =========================
     🔥 Auto Close If Empty
  ========================= */
  useEffect(() => {
    if (state.items.length === 0 && state.isOpen) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLOSE_CART" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.items]);

  const safeSubtotal = Number(totalAmount ?? 0);
  const safeDelivery = Number(deliveryCharge ?? 0);
  const safeTotal = safeSubtotal + safeDelivery;

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">
                  Your Cart ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => dispatch({ type: "CLOSE_CART" })}
                className="p-2 rounded-lg hover:bg-secondary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.items.length === 0 ? (
                /* =========================
                   🔥 Empty State (Dominos Style)
                ========================= */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                  >
                    <ShoppingBag className="w-12 h-12 text-primary" />
                  </motion.div>

                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Your cart feels lonely 🍕
                  </h3>

                  <p className="text-sm text-muted-foreground mb-6">
                    Add some delicious pizzas and make it happy!
                  </p>

                  <div className="flex flex-col gap-3 w-full">
  {/* 🔥 Browse Menu */}
  <button
    onClick={() => {
      dispatch({ type: "CLOSE_CART" });
      navigate("/menu");
    }}
    className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition"
  >
    Browse Menu
  </button>

  {/* 🔥 Best Sellers */}
  <button
    onClick={() => {
      dispatch({ type: "CLOSE_CART" });
      navigate("/", { state: { scrollTo: "featured" } });
    }}
    className="w-full border border-border text-foreground py-3 rounded-lg hover:bg-secondary transition"
  >
    View Best Sellers
  </button>
</div>
                </motion.div>
              ) : (
                /* =========================
                   🔥 Cart Items
                ========================= */
                <div className="space-y-4">
                  <AnimatePresence>
                    {state.items.map((item) => {
                      const variantPrice = Number(
                        item.variant?.price ?? 0
                      );

                      const addonTotal = item.addons.reduce(
                        (s, a) => s + Number(a.price ?? 0),
                        0
                      );

                      const quantity = Number(item.quantity ?? 0);

                      const lineTotal =
                        (variantPrice + addonTotal) * quantity;

                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />

                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {item.product.name}
                            </h4>

                            <p className="text-xs text-muted-foreground">
                              {item.variant.name}
                            </p>

                            {item.addons.length > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                +{" "}
                                {item.addons
                                  .map((a) => a.name)
                                  .join(", ")}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    dispatch({
                                      type: "UPDATE_QUANTITY",
                                      payload: {
                                        id: item.id,
                                        quantity:
                                          item.quantity - 1,
                                      },
                                    })
                                  }
                                  className="w-7 h-7 rounded-md bg-background flex items-center justify-center hover:bg-primary hover:text-white transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                  }}
                                  className="font-semibold w-5 text-center"
                                >
                                  {item.quantity}
                                </motion.span>

                                <button
                                  onClick={() =>
                                    dispatch({
                                      type: "UPDATE_QUANTITY",
                                      payload: {
                                        id: item.id,
                                        quantity:
                                          item.quantity + 1,
                                      },
                                    })
                                  }
                                  className="w-7 h-7 rounded-md bg-background flex items-center justify-center hover:bg-primary hover:text-white transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-bold text-sm">
                                ₹{lineTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {confirmId === item.id ? (
                            <div className="flex flex-col gap-1 text-xs">
                              <button
                                onClick={() =>
                                  setConfirmId(null)
                                }
                                className="text-muted-foreground"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  dispatch({
                                    type: "REMOVE_ITEM",
                                    payload: item.id,
                                  });
                                  setConfirmId(null);
                                }}
                                className="text-red-500 font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmId(item.id)
                              }
                              className="self-start text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{safeSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>₹{safeDelivery.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold border-t pt-3">
                  <span>Total</span>
                  <span>₹{safeTotal.toFixed(2)}</span>
                </div>

                <Link
                  to="/checkout"
                  onClick={() =>
                    dispatch({ type: "CLOSE_CART" })
                  }
                  className="block w-full bg-primary text-white text-center py-4 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Proceed to Checkout — ₹{safeTotal.toFixed(2)}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;