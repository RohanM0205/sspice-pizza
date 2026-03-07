import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import AdminLayout from "../AdminLayout";
import DeliveryOrderCard from "./DeliveryOrderCard";
import { useAuth } from "@/context/AuthContext";

const DeliveryDashboard = () => {

  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pickup" | "delivery" | "completed">("pickup");
  const [loading, setLoading] = useState(true);

  const [activeDeliveryOrderId, setActiveDeliveryOrderId] = useState<string | null>(null);

  const gpsWatchRef = useRef<number | null>(null);

  /* -----------------------------
     Get admin_users.id
  ----------------------------- */

  useEffect(() => {

    const fetchAdminUser = async () => {

      if (!user) return;

      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (error) {
        toast.error("Failed loading delivery profile");
        return;
      }

      if (data) {
        setAdminId(data.id);
      }

    };

    fetchAdminUser();

  }, [user]);

  /* -----------------------------
      Fetch Orders
  ----------------------------- */

  const fetchOrders = async () => {

    if (!adminId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers(name, phone),
        customer_addresses(address_line, city),

        order_items(
          id,
          quantity,
          price,
          products(name)
        )
      `)
      .eq("delivery_person_id", adminId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed loading orders");
      setLoading(false);
      return;
    }

    const fetchedOrders = data || [];

    setOrders(fetchedOrders);

    const activeOrder = fetchedOrders.find(
      (o:any) => o.order_status === "out_for_delivery"
    );

    setActiveDeliveryOrderId(activeOrder?.id || null);

    setLoading(false);

  };

  useEffect(() => {
    fetchOrders();
  }, [adminId]);

  /* -----------------------------
      Realtime Updates
  ----------------------------- */

  useEffect(() => {

    if (!adminId) return;

    const channel = supabase
      .channel("delivery-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [adminId]);

  /* -----------------------------
      GPS TRACKING
  ----------------------------- */

  useEffect(() => {

    if (!activeDeliveryOrderId || !adminId) {

      if (gpsWatchRef.current) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }

      return;
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    toast.info("Live delivery tracking started");

    gpsWatchRef.current = navigator.geolocation.watchPosition(

      async (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {

          await supabase
            .from("delivery_locations")
            .upsert({
              order_id: activeDeliveryOrderId,
              delivery_person_id: adminId,
              latitude: lat,
              longitude: lng,
              updated_at: new Date().toISOString()
            });

        } catch (err) {
          console.error("Location update failed", err);
        }

      },

      (error) => {
        console.error("GPS Error:", error);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }

    );

    return () => {

      if (gpsWatchRef.current) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }

    };

  }, [activeDeliveryOrderId, adminId]);

  /* -----------------------------
      Actions
  ----------------------------- */

  const startDelivery = async (orderId: string) => {

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "out_for_delivery",
        dispatched_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed starting delivery");
    } else {
      toast.success("Delivery started");
      fetchOrders();
    }

  };

  const markDelivered = async (orderId: string) => {

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "delivered",
        completed_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed updating order");
    } else {
      toast.success("Order delivered");
      fetchOrders();
    }

  };

  const collectCash = async (orderId: string) => {

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

  /* -----------------------------
      Filters
  ----------------------------- */

  const pickupOrders = orders.filter(
    (o) => o.order_status === "preparing"
  );

  const deliveryOrders = orders.filter(
    (o) => o.order_status === "out_for_delivery"
  );

  const completedOrders = orders.filter(
    (o) => o.order_status === "delivered"
  );

  let displayedOrders: any[] = [];

  if (activeTab === "pickup") displayedOrders = pickupOrders;
  if (activeTab === "delivery") displayedOrders = deliveryOrders;
  if (activeTab === "completed") displayedOrders = completedOrders;

  return (

    <AdminLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Delivery Dashboard
        </h1>

      </div>

      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setActiveTab("pickup")}
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "pickup"
              ? "bg-primary text-white"
              : "bg-card border-border"
          }`}
        >
          Pickup Orders ({pickupOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "delivery"
              ? "bg-primary text-white"
              : "bg-card border-border"
          }`}
        >
          Out For Delivery ({deliveryOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "completed"
              ? "bg-primary text-white"
              : "bg-card border-border"
          }`}
        >
          Completed Today ({completedOrders.length})
        </button>

      </div>

      {loading && (
        <p className="text-muted-foreground">
          Loading orders...
        </p>
      )}

      <div className="space-y-6">

        {displayedOrders.map((order) => (

          <DeliveryOrderCard
            key={order.id}
            order={order}
            onStartDelivery={startDelivery}
            onMarkDelivered={markDelivered}
            onCollectCash={collectCash}
          />

        ))}

        {!loading && displayedOrders.length === 0 && (
          <p className="text-muted-foreground">
            No orders in this section.
          </p>
        )}

      </div>

    </AdminLayout>

  );

};

export default DeliveryDashboard;