import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Phone,
  Receipt,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);

      const { data: orderData } = await supabase
        .from("orders")
        .select(
          `
          *,
          customer_addresses (*)
        `
        )
        .eq("id", orderId)
        .single();

      if (orderData) {
        setOrder(orderData);

        const { data: itemData } = await supabase
          .from("order_items")
          .select(
            `
            quantity,
            price,
            products (name),
            product_variants (name)
          `
          )
          .eq("order_id", orderId);

        if (itemData) setItems(itemData);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (!orderId) {
    return (
      <>
        <Navbar />
        <div className="pt-24 text-center">
          Invalid Order.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <main>
      <Navbar />

      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">

          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <h1 className="text-3xl font-bold mb-3">
              Order Confirmed 🎉
            </h1>

            <p className="text-muted-foreground">
              Your delicious food is being prepared!
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center">Loading order details...</div>
          ) : (
            <>
              {/* Order Info Card */}
              <div className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4">

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Order ID
                  </span>
                  <span className="font-mono font-bold">
                    #{order.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-500 text-white">
                    {order.order_status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Estimated Delivery</span>
                  <span className="flex items-center gap-1 text-accent font-medium">
                    <Clock className="w-4 h-4" />
                    30–40 mins
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Payment</span>
                  <span className="capitalize">
                    {order.payment_method}
                  </span>
                </div>

                {/* Address */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      {order.customer_addresses?.address_line},{" "}
                      {order.customer_addresses?.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">
                  Order Summary
                </h3>

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm mb-3"
                  >
                    <span>
                      {item.products?.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3 mt-3 font-bold flex justify-between">
                  <span>Total Paid</span>
                  <span>₹{order.final_amount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">

                <Link
                  to={`/track-order?orderId=${order.id}`}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold"
                >
                  <Truck className="w-4 h-4" />
                  Track Order
                </Link>

                <button
                  onClick={() => {
                    toast.success("Invoice download coming soon 🚀");
                  }}
                  className="flex items-center justify-center gap-2 bg-secondary border py-3 rounded-xl font-semibold"
                >
                  <Receipt className="w-4 h-4" />
                  Download Invoice
                </button>

                <Link
                  to="/menu"
                  className="flex items-center justify-center gap-2 border py-3 rounded-xl"
                >
                  Order More
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 border py-3 rounded-xl"
                >
                  <Phone className="w-4 h-4" />
                  Call Restaurant
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default OrderSuccessPage;