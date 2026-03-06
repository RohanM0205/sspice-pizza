import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../AdminLayout";
import { toast } from "sonner";
import OrderCard from "../Orders/OrderCard";
import AssignDeliveryModal from "../Orders/AssignDeliveryModal";

const PAGE_SIZE = 10;

const AcceptedOrdersPage = () => {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [assignOrder, setAssignOrder] = useState<string | null>(null);

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  const fetchOrders = async () => {

    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("orders")
      .select(`
        *,
        delivery_person_id,
        delivery:admin_users_with_profile!orders_delivery_person_id_fkey (
    id,
    name,
    email
  ),
        customers(name, phone),
        customer_addresses(address_line, city),

        order_items(
          id,
          quantity,
          price,
          products(name),
          product_variants(variant_name),
          order_item_addons(
            id,
            addon_id,
            product_addons(name)
          )
        )
      `, { count: "exact" })
      .in("order_status", [
        "preparing",
        "out_for_delivery",
        "delivered"
      ])
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      toast.error("Failed loading orders");
      setLoading(false);
      return;
    }

    let filtered = data || [];

    if (searchQuery.trim()) {

      const s = searchQuery.toLowerCase();

      filtered = filtered.filter((o:any)=>
        o.id.toLowerCase().includes(s) ||
        o.customers?.name?.toLowerCase().includes(s) ||
        o.customers?.phone?.includes(s)
      );

    }

    setOrders(filtered);
    setTotalOrders(count || filtered.length);

    setLoading(false);
  };

  useEffect(() => {

    fetchOrders();

  }, [page, searchQuery]);

  useEffect(() => {

    const channel = supabase
      .channel("accepted-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {

    const payload: any = { order_status: newStatus };

    if (newStatus === "out_for_delivery")
      payload.dispatched_at = new Date().toISOString();

    if (newStatus === "delivered")
      payload.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId);

    if (error) {
      toast.error("Failed updating order");
    } else {
      toast.success("Order updated");
      fetchOrders();
    }

  };

  const markCashCollected = async (orderId: string) => {

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid"
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed updating payment");
    } else {
      toast.success("Cash collected");
      fetchOrders();
    }

  };

  return (
    <AdminLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Accepted Orders
        </h1>

        {/* SEARCH */}

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Search Order ID / Name / Phone..."
            value={searchInput}
            onChange={(e)=>setSearchInput(e.target.value)}
            className="bg-card border border-border px-4 py-2 rounded-lg text-sm w-72"
          />

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Search
          </button>

          {searchQuery && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 bg-card border border-border rounded-lg"
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {loading && (
        <p className="text-muted-foreground">
          Loading orders...
        </p>
      )}

      {/* ORDERS */}

      <div className="space-y-6">

        {orders.map((order) => (

          <OrderCard
            key={order.id}
            order={order}
            type="accepted"
            onAssignDelivery={setAssignOrder}
            onUpdateStatus={updateStatus}
            onCashCollected={markCashCollected}
          />

        ))}

        {!loading && orders.length === 0 && (
          <p className="text-muted-foreground">
            No orders found.
          </p>
        )}

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="flex justify-center items-center gap-3 mt-10">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

      <AssignDeliveryModal
        open={!!assignOrder}
        orderId={assignOrder}
        onClose={() => setAssignOrder(null)}
        onAssigned={fetchOrders}
      />

    </AdminLayout>
  );
};

export default AcceptedOrdersPage;