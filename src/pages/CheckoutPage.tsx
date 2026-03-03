import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, User, CreditCard, Banknote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { state, totalAmount, deliveryCharge, dispatch } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Kalyan",
    paymentMethod: "cod" as "cod" | "razorpay",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (state.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Simulate order placement
    const orderId = `KB${Date.now().toString().slice(-8)}`;
    dispatch({ type: "CLEAR_CART" });
    navigate(`/order-success?orderId=${orderId}`);
  };

  if (state.items.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground font-sans text-lg mb-4">Your cart is empty</p>
            <a href="/menu" className="text-primary font-sans font-medium hover:underline">
              Browse Menu
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="pt-20 pb-24 md:pb-12">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Delivery Details</h3>

                <div>
                  <label className="text-sm font-sans font-medium text-dim block mb-1.5">
                    <User className="w-4 h-4 inline mr-1" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-sans font-medium text-dim block mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-sm font-sans font-medium text-dim block mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" /> Delivery Address *
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Full address with landmark"
                  />
                </div>

                <div>
                  <label className="text-sm font-sans font-medium text-dim block mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Payment Method</h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: "cod" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-sans font-medium transition-all ${
                      form.paymentMethod === "cod"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: "razorpay" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-sans font-medium transition-all ${
                      form.paymentMethod === "razorpay"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay Online
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-sans font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-all glow-red"
              >
                Place Order — ₹{totalAmount + deliveryCharge}
              </button>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  {state.items.map((item) => {
                    const addonTotal = item.addons.reduce((s, a) => s + a.price, 0);
                    return (
                      <div key={item.id} className="flex justify-between text-sm font-sans">
                        <span className="text-dim">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-foreground font-medium">
                          ₹{(item.variant.price + addonTotal) * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-dim">Subtotal</span>
                    <span className="text-foreground">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-dim">Delivery</span>
                    <span className="text-foreground">₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-base font-sans font-bold border-t border-border pt-3">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent">₹{totalAmount + deliveryCharge}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default CheckoutPage;
