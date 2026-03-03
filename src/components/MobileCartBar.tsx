import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const MobileCartBar = () => {
  const { totalItems, totalAmount, dispatch } = useCart();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 bg-background/95 backdrop-blur-lg border-t border-border"
      >
        <button
          onClick={() => dispatch({ type: "TOGGLE_CART" })}
          className="w-full flex items-center justify-between bg-primary text-primary-foreground font-sans font-bold px-5 py-3.5 rounded-xl glow-red"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span>{totalItems} item{totalItems > 1 ? "s" : ""}</span>
          </div>
          <span>View Cart — ₹{totalAmount}</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileCartBar;
