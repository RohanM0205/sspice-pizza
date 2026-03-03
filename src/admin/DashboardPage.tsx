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

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("orders").select("*");

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
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} />
        <StatCard title="Today's Orders" value={stats.todayOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value }: any) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <p className="text-sm text-muted-foreground">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

export default DashboardPage;