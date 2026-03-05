import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Navbar = () => {
  const { totalItems, dispatch } = useCart();
  const { user, role, signOut } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState("User");

  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchName = async () => {
      if (!user) {
        setFirstName("User");
        return;
      }

      const { data } = await supabase
        .from("customers")
        .select("name")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (data?.name) {
        setFirstName(data.name.split(" ")[0]);
      } else {
        setFirstName("User");
      }
    };

    fetchName();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-20 px-6">

        {/* Logo */}
        <Link to="/">
          <img
            src="https://res.cloudinary.com/dytq68dhv/image/upload/v1772710725/complete3_atunro.png"
            alt="Sspice Pizza"
            className="h-[70px] w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium">
                Hello, {firstName}
              </span>

              <Link to="/profile" className="text-sm hover:text-primary">
                Profile
              </Link>

              {role === "superadmin" && (
                <Link
                  to="/admin/manage-admins"
                  className="text-sm font-semibold text-purple-500 hover:text-purple-600"
                >
                  Super Admin Panel
                </Link>
              )}

              {role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-accent hover:text-primary"
                >
                  Admin Dashboard
                </Link>
              )}

              {role === "delivery" && (
                <Link
                  to="/admin/delivery"
                  className="text-sm font-semibold text-green-500 hover:text-green-600"
                >
                  Delivery Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <a href="tel:+919876543210" className="hidden sm:flex gap-2">
            <Phone className="w-4 h-4" />
            Call
          </a>

          <button
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="relative p-2 bg-primary text-white rounded-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-accent text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;