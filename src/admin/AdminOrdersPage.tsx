import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  placed: "bg-yellow-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

const paymentColors: Record<string, string> = {
  paid: "bg-green-600",
  pending: "bg-yellow-500",
  failed: "bg-red-600",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (name, phone),
        customer_addresses (address_line, city),
        order_items (
          quantity,
          price,
          products (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load orders");
    else setOrders(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
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

    if (error) toast.error("Failed to update status");
    else toast.success("Order updated");
  };

  const getOrderAge = (createdAt: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 60000
    );

    if (diff < 5) return "text-green-500";
    if (diff < 10) return "text-yellow-500";
    return "text-red-500";
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.order_status !== filter) return false;

      if (
        search &&
        !(
          o.customers?.phone?.includes(search) ||
          o.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.id.includes(search)
        )
      )
        return false;

      return true;
    });
  }, [orders, filter, search]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 mb-8">

        <h1 className="text-3xl font-bold">Orders</h1>

        {/* SEARCH + FILTER */}
        <div className="flex gap-4 flex-wrap">

          <input
            placeholder="Search order / phone / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-secondary"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-secondary"
          >
            <option value="all">All</option>
            <option value="placed">Placed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>
      </div>

      {loading && <p>Loading...</p>}

      <div className="space-y-6">

        {filteredOrders.map((order) => (

          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
          >

            {/* HEADER */}
            <div className="flex justify-between mb-4">

              <div>

                <h3 className="font-bold text-lg">
                  Order #{order.id.slice(0, 8)}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {order.customers?.name} • {order.customers?.phone}
                </p>

                <p className="text-xs text-muted-foreground">
                  📍 {order.customer_addresses?.address_line},{" "}
                  {order.customer_addresses?.city}
                </p>

                <p className={`text-xs mt-1 ${getOrderAge(order.created_at)}`}>
                  ⏱ {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)} minutes ago
                </p>

              </div>

              <div className="flex flex-col items-end gap-2">

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 text-white text-xs rounded-full ${
                    statusColors[order.order_status]
                  }`}
                >
                  {order.order_status.replaceAll("_", " ")}
                </span>

                {/* PAYMENT BADGE */}
                <span
                  className={`px-3 py-1 text-white text-xs rounded-full ${
                    paymentColors[order.payment_status]
                  }`}
                >
                  {order.payment_method.toUpperCase()} • {order.payment_status}
                </span>

              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-2 mb-4">

              {order.order_items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm border-b border-border pb-1"
                >
                  <span>
                    {item.products?.name} × {item.quantity}
                  </span>

                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}

            </div>

            {/* TOTAL BREAKDOWN */}
            <div className="text-sm space-y-1 border-t border-border pt-3">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{order.delivery_charge}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.final_amount}</span>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4 flex-wrap">

              <button
                onClick={() => updateStatus(order.id, "preparing")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Preparing
              </button>

              <button
                onClick={() => updateStatus(order.id, "out_for_delivery")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              >
                Dispatch
              </button>

              <button
                onClick={() => updateStatus(order.id, "delivered")}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Delivered
              </button>

              <button
                onClick={() => updateStatus(order.id, "cancelled")}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              {/* EXISTING DROPDOWN (kept) */}
              <select
                value={order.order_status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="px-3 py-1 border border-border bg-secondary rounded"
              >
                <option value="placed">Placed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

            </div>

          </motion.div>

        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;