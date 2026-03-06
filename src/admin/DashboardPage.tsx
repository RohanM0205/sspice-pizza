import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";

const DashboardPage = () => {

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {

    const fetchStats = async () => {

      const { data } = await supabase
        .from("orders")
        .select("*");

      if (!data) return;

      const today = new Date().toDateString();

      const totalRevenue = data.reduce(
        (sum, o) => sum + o.final_amount,
        0
      );

      const todayOrders = data.filter(
        (o) =>
          new Date(o.created_at).toDateString() === today
      ).length;

      const pendingOrders = data.filter(
        (o) => o.order_status === "placed"
      ).length;

      setStats({
        totalOrders: data.length,
        totalRevenue,
        todayOrders,
        pendingOrders,
      });

      setRecentOrders(data.slice(0,5));
    };

    fetchStats();

  }, []);

  return (
    <AdminLayout>

      <h1 className="text-3xl font-bold mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} />
        <StatCard title="Today's Orders" value={stats.todayOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />

      </div>

      <h2 className="text-xl font-bold mb-4">
        Recent Orders
      </h2>

      <div className="space-y-3">

        {recentOrders.map((o) => (

          <div
            key={o.id}
            className="bg-card border border-border p-4 rounded-lg"
          >

            <p className="font-semibold">
              #{o.id.slice(0,8)}
            </p>

            <p className="text-sm text-muted-foreground">
              ₹{o.final_amount}
            </p>

          </div>

        ))}

      </div>

    </AdminLayout>
  );
};

const StatCard = ({ title, value }: any) => (
  <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition">
    <p className="text-sm text-muted-foreground">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

export default DashboardPage;