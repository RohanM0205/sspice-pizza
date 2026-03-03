import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    expiry_date: "",
  });

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCoupons(data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("coupons").insert([
      {
        restaurant_id: RESTAURANT_ID,
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        expiry_date: form.expiry_date,
        is_active: true,
      },
    ]);

    if (error) {
      toast.error("Failed to create coupon");
      return;
    }

    toast.success("Coupon created");
    setForm({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      expiry_date: "",
    });

    fetchCoupons();
  };

  const toggleCoupon = async (id: string, current: boolean) => {
    await supabase
      .from("coupons")
      .update({ is_active: !current })
      .eq("id", id);

    fetchCoupons();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">
        Coupon Management
      </h1>

      {/* Create Coupon */}
      <form
        onSubmit={handleCreate}
        className="bg-card border rounded-xl p-6 mb-8 space-y-4"
      >
        <h2 className="font-bold text-lg">
          Create New Coupon
        </h2>

        <input
          type="text"
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
          className="w-full px-4 py-3 border rounded-lg"
        />

        <select
          value={form.discount_type}
          onChange={(e) =>
            setForm({
              ...form,
              discount_type: e.target.value,
            })
          }
          className="w-full px-4 py-3 border rounded-lg"
        >
          <option value="percentage">
            Percentage
          </option>
          <option value="fixed">
            Fixed Amount
          </option>
        </select>

        <input
          type="number"
          placeholder="Discount Value"
          value={form.discount_value}
          onChange={(e) =>
            setForm({
              ...form,
              discount_value: e.target.value,
            })
          }
          className="w-full px-4 py-3 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Minimum Order Amount"
          value={form.min_order_amount}
          onChange={(e) =>
            setForm({
              ...form,
              min_order_amount: e.target.value,
            })
          }
          className="w-full px-4 py-3 border rounded-lg"
        />

        <input
          type="date"
          value={form.expiry_date}
          onChange={(e) =>
            setForm({
              ...form,
              expiry_date: e.target.value,
            })
          }
          className="w-full px-4 py-3 border rounded-lg"
        />

        <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold">
          Create Coupon
        </button>
      </form>

      {/* Coupon List */}
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-card border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">
                {coupon.code}
              </h3>
              <p className="text-sm text-muted-foreground">
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}%`
                  : `₹${coupon.discount_value}`}{" "}
                off
              </p>
              <p className="text-xs">
                Min Order ₹{coupon.min_order_amount}
              </p>
            </div>

            <button
              onClick={() =>
                toggleCoupon(
                  coupon.id,
                  coupon.is_active
                )
              }
              className={`px-4 py-2 rounded-lg text-white ${
                coupon.is_active
                  ? "bg-green-600"
                  : "bg-gray-500"
              }`}
            >
              {coupon.is_active
                ? "Active"
                : "Inactive"}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCouponsPage;