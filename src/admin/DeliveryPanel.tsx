import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const DeliveryPanel = () => {
  const { role } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        final_amount,
        customers(name,phone),
        customer_addresses(address_line,city)
      `)
      .eq("order_status", "out_for_delivery")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load orders");
    else setOrders(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("delivery-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        fetchOrders
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: "delivered" })
      .eq("id", orderId);

    if (error) toast.error("Failed to update order");
    else {
      toast.success("Order delivered");
      fetchOrders();
    }
  };

  if (!["delivery", "admin", "superadmin"].includes(role || "")) {
    return <div className="p-6 text-red-500">Access denied</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-background">

      <h1 className="text-3xl font-bold mb-8">
        Delivery Orders
      </h1>

      {orders.map((order) => (

        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-6 rounded-xl mb-4 shadow-sm"
        >

          <h3 className="font-bold text-lg">
            {order.customers?.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {order.customers?.phone}
          </p>

          <p className="text-sm mt-2">
            📍 {order.customer_addresses?.address_line},{" "}
            {order.customer_addresses?.city}
          </p>

          <p className="text-sm mt-2 font-bold">
            Order Total: ₹{order.final_amount}
          </p>

          <button
            onClick={() => markDelivered(order.id)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Mark Delivered
          </button>

        </motion.div>

      ))}
    </div>
  );
};

export default DeliveryPanel;