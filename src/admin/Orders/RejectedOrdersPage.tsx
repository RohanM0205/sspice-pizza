import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../AdminLayout";

const PAGE_SIZE = 10;

const RejectedOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  const fetchOrders = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers(name,phone),
        order_items(
          id,
          quantity,
          price,
          products(name)
        )
      `,
        { count: "exact" }
      )
      .eq("order_status", "cancelled")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let filtered = data || [];

    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (o: any) =>
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

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rejected Orders</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search Order ID / Name / Phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
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
        <p className="text-muted-foreground">Loading orders...</p>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-muted-foreground">No rejected orders found.</p>
      )}

      <div className="space-y-6">
        {orders.map((order: any) => (
          <div
            key={order.id}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-semibold text-lg">
              Order #{order.id.slice(0, 8)}
            </h3>

            <p className="text-sm text-muted-foreground">
              {order.customers?.name} • {order.customers?.phone}
            </p>

            <p className="text-red-500 mt-2 text-sm">
              Reason: {order.rejection_reason || "Not specified"}
            </p>

            <div className="mt-4 space-y-1">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.products?.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
    </AdminLayout>
  );
};

export default RejectedOrdersPage;