import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { state, dispatch, totalAmount, totalItems, deliveryCharge } = useCart();

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
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
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
                <h2 className="font-display text-lg font-bold text-foreground">
                  Your Cart ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => dispatch({ type: "CLOSE_CART" })}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-sans">Your cart is empty</p>
                  <button
                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                    className="mt-4 text-primary font-sans font-medium hover:underline"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                state.items.map((item) => {
                  const addonTotal = item.addons.reduce((s, a) => s + a.price, 0);
                  const lineTotal = (item.variant.price + addonTotal) * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-semibold text-foreground text-sm truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-dim font-sans">{item.variant.name}</p>
                        {item.addons.length > 0 && (
                          <p className="text-[10px] text-dim font-sans">
                            + {item.addons.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: "UPDATE_QUANTITY",
                                  payload: { id: item.id, quantity: item.quantity - 1 },
                                })
                              }
                              className="w-7 h-7 rounded-md bg-background flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-sans font-semibold text-foreground w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: "UPDATE_QUANTITY",
                                  payload: { id: item.id, quantity: item.quantity + 1 },
                                })
                              }
                              className="w-7 h-7 rounded-md bg-background flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-sans font-bold text-foreground text-sm">
                            ₹{lineTotal}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                        className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-dim">Subtotal</span>
                  <span className="text-foreground font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-dim">Delivery</span>
                  <span className="text-foreground font-medium">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-base font-sans font-bold border-t border-border pt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-accent">₹{totalAmount + deliveryCharge}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch({ type: "CLOSE_CART" })}
                  className="block w-full bg-primary text-primary-foreground font-sans font-bold text-center py-4 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] glow-red"
                >
                  Proceed to Checkout — ₹{totalAmount + deliveryCharge}
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
