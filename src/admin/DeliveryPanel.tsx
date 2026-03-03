import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const DeliveryPanel = () => {
  const { role } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_status,
          created_at,
          customers (
            name,
            phone
          )
        `)
        .eq("order_status", "out_for_delivery")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error("Delivery fetch error:", err);
      toast.error("Failed to load delivery orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("delivery-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // only updates
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔥 Mark Delivered
  const markDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: "delivered" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order");
    } else {
      toast.success("Order marked as delivered");
      fetchOrders();
    }
  };

  // 🔒 Safety: only delivery/admin/superadmin
  if (!["delivery", "admin", "superadmin"].includes(role || "")) {
    return (
      <div className="p-6 text-center text-red-500">
        Access denied.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold mb-8">
        Delivery Panel
      </h1>

      {loading && (
        <p className="text-muted-foreground">Loading orders...</p>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-muted-foreground">
          No orders currently out for delivery.
        </p>
      )}

      {!loading &&
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border p-6 rounded-lg mb-4 shadow-sm"
          >
            <h3 className="font-bold text-lg">
              {order.customers?.name || "No Name"}
            </h3>

            <p className="text-sm text-muted-foreground">
              {order.customers?.phone || "No Phone"}
            </p>

            <p className="text-xs mt-2 text-muted-foreground">
              Order ID: {order.id}
            </p>

            <button
              onClick={() => markDelivered(order.id)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              Mark as Delivered
            </button>
          </div>
        ))}
    </div>
  );
};

export default DeliveryPanel;