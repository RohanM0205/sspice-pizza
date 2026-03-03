import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  placed: "bg-yellow-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (name, phone),
        order_items (
          quantity,
          price,
          products (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load orders");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
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

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Order updated");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {order.customers?.name} • {order.customers?.phone}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-white text-xs rounded-full ${
                    statusColors[order.order_status]
                  }`}
                >
                  {order.order_status.replaceAll("_", " ")}
                </span>

                <select
                  value={order.order_status}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value)
                  }
                  className="px-3 py-1 border border-border bg-secondary rounded-lg text-sm"
                >
                  <option value="placed">Placed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">
                    Out for Delivery
                  </option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              {order.order_items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.products?.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">
                Payment: {order.payment_method}
              </span>
              <span className="font-bold">
                Total: ₹{order.final_amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;