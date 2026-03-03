import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusSteps = [
  "placed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);

  const fetchOrder = async () => {
    if (!orderId) return;

    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          price,
          products (name)
        )
      `)
      .eq("id", orderId)
      .single();

    if (data) setOrder(data);
  };

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel("customer-order-track")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!order)
    return (
      <>
        <Navbar />
        <div className="pt-24 text-center">
          <p>Loading order...</p>
        </div>
        <Footer />
      </>
    );

  const currentStepIndex = statusSteps.indexOf(order.order_status);

  return (
    <>
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Track Your Order
        </h1>

        {/* Timeline */}
        <div className="flex justify-between items-center mb-10">
          {statusSteps.map((step, index) => (
            <div key={step} className="flex-1 text-center">
              <div
                className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  index <= currentStepIndex
                    ? "bg-green-600"
                    : "bg-gray-400"
                }`}
              >
                ✓
              </div>
              <p className="text-xs mt-2 capitalize">
                {step.split("_").join(" ")}
              </p>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold mb-4">Order Items</h3>

          {order.order_items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between mb-2 text-sm">
              <span>
                {item.products?.name} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.final_amount}</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TrackOrderPage;