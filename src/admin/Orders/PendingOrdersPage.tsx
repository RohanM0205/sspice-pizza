import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../AdminLayout";
import RejectReasonModal from "./RejectReasonModal";
import OrderCard from "./OrderCard";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const PendingOrdersPage = () => {

  const [orders, setOrders] = useState<any[]>([]);
  const [rejectOrder, setRejectOrder] = useState<any>(null);
  const [highlightedOrder, setHighlightedOrder] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ----------------------------
      Notification Sound
  ---------------------------- */

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  /* ----------------------------
      Fetch Orders
  ---------------------------- */

  const fetchOrders = async () => {

    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("orders")
      .select(`
        *,
        customers(name, phone),
        customer_addresses(address_line, city),

        order_items(
          id,
          quantity,
          price,

          products(name),

          product_variants(
            variant_name
          ),

          order_item_addons(
            id,
            addon_id,
            product_addons(name)
          )
        )
      `, { count: "exact" })
      .eq("order_status", "placed")
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

  /* ----------------------------
      Realtime Listener
  ---------------------------- */

  useEffect(() => {

    fetchOrders();

    const channel = supabase
      .channel("pending-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        async (payload) => {

          const newOrder = payload.new;

          if (newOrder.order_status !== "placed") return;

          const { data } = await supabase
            .from("orders")
            .select(`
              *,
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
            `)
            .eq("id", newOrder.id)
            .single();

          if (!data) return;

          setOrders((prev) => [data, ...prev]);

          setHighlightedOrder(data.id);

          audioRef.current?.play().catch(() => {});

          toast.success("New order received!");

          setTimeout(() => {
            setHighlightedOrder(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [page, searchQuery]);

  /* ----------------------------
      Accept Order
  ---------------------------- */

  const acceptOrder = async (id: string) => {

    const previous = [...orders];

    setOrders((prev) => prev.filter((o) => o.id !== id));

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "preparing",
        accepted_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to accept order");
      setOrders(previous);
    } else {
      toast.success("Order accepted");
      fetchOrders();
    }
  };

  /* ----------------------------
      Reject Order
  ---------------------------- */

  const rejectOrderSubmit = async (reason: string) => {

    if (!rejectOrder) return;

    const previous = [...orders];

    setOrders((prev) =>
      prev.filter((o) => o.id !== rejectOrder.id)
    );

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq("id", rejectOrder.id);

    if (error) {
      toast.error("Failed rejecting order");
      setOrders(previous);
    } else {
      toast.success("Order rejected");
    }

    setRejectOrder(null);
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  /* ----------------------------
      UI
  ---------------------------- */

  return (
    <AdminLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Pending Orders
        </h1>

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Search Order ID / Name / Phone..."
            value={searchInput}
            onChange={(e)=>setSearchInput(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key === "Enter") handleSearch()
            }}
            className="bg-card border border-border px-4 py-2 rounded-lg text-sm w-72"
          />

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-white rounded-lg"
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

      {orders.length === 0 && !loading && (
        <p className="text-muted-foreground">
          No pending orders.
        </p>
      )}

      <div className="space-y-6">

        {orders.map((order) => (

          <div
            key={order.id}
            className={`transition-all duration-500 ${
              highlightedOrder === order.id
                ? "ring-2 ring-green-500 shadow-green-500/40 shadow-lg animate-pulse"
                : ""
            }`}
          >

            <OrderCard
              order={order}
              type="pending"
              onAccept={acceptOrder}
              onReject={setRejectOrder}
            />

          </div>

        ))}

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

      <RejectReasonModal
        open={!!rejectOrder}
        onClose={() => setRejectOrder(null)}
        onSubmit={rejectOrderSubmit}
      />

    </AdminLayout>
  );
};

export default PendingOrdersPage;