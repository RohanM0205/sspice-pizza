import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, final_amount");

      if (!orders) return;

      const monthlyMap: Record<string, ChartData> = {};

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const monthKey = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            month: monthKey,
            revenue: 0,
            orders: 0,
          };
        }

        monthlyMap[monthKey].revenue += order.final_amount;
        monthlyMap[monthKey].orders += 1;
      });

      setData(Object.values(monthlyMap));
    };

    fetchAnalytics();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Sales Analytics</h1>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Revenue Overview
        </h2>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#C1121F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;