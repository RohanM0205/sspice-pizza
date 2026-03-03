import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const { totalItems, dispatch } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="font-display text-primary-foreground text-lg font-bold">K</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Kalyan<span className="text-primary">Bites</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-sans text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+919876543210"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call to Order
          </a>

          <button
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="relative p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${
                    location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-base font-medium text-accent py-2"
              >
                <Phone className="w-4 h-4" />
                Call to Order
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
