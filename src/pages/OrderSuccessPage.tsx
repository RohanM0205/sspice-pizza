import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-12 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-veg/20 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-veg" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            Order Placed! 🎉
          </h1>
          <p className="text-dim font-sans text-lg mb-6">
            Thank you for your order. Your food is being prepared with love.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between font-sans text-sm">
              <span className="text-dim">Order ID</span>
              <span className="text-foreground font-mono font-bold">{orderId}</span>
            </div>
            <div className="flex justify-between font-sans text-sm items-center">
              <span className="text-dim">Estimated Delivery</span>
              <span className="text-accent font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" /> 30–40 mins
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all"
            >
              Order More
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="text-dim font-sans text-sm hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
};

export default OrderSuccessPage;
