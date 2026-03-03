import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusColors: Record<string, string> = {
  placed: "bg-yellow-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (customerData) {
      setCustomer(customerData);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });

      if (orderData) {
        setOrders(orderData);

        const spent = orderData.reduce(
          (sum, o) => sum + o.final_amount,
          0
        );
        setTotalSpent(spent);
      }
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  if (!user)
    return (
      <>
        <Navbar />
        <div className="pt-24 text-center">
          <p>Please login to view your profile.</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          My Profile
        </h1>

        {/* Customer Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-2">
            {customer?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {customer?.email}
          </p>
          <p className="text-sm text-muted-foreground">
            {customer?.phone}
          </p>

          <div className="mt-4 text-sm">
            <span className="font-semibold">Total Orders:</span>{" "}
            {orders.length}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Total Spent:</span>{" "}
            ₹{totalSpent}
          </div>
        </div>

        {/* Order History */}
        <h2 className="text-2xl font-bold mb-6">
          Order History
        </h2>

        {orders.length === 0 && <p>No orders yet.</p>}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 text-white text-xs rounded-full ${
                    statusColors[order.order_status]
                  }`}
                >
                  {order.order_status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  ₹{order.final_amount}
                </p>

                <div className="flex gap-3 justify-end">
                  <Link
                    to={`/track-order?orderId=${order.id}`}
                    className="text-primary text-sm"
                  >
                    Track
                  </Link>

                  <button
                    onClick={async () => {
                      const { data: items, error } = await supabase
                        .from("order_items")
                        .select(`
                          quantity,
                          product_id,
                          variant_id,
                          products (*),
                          product_variants (*)
                        `)
                        .eq("order_id", order.id);

                      if (error || !items) {
                        toast.error("Failed to reorder");
                        return;
                      }

                      const reorderedItems = items.map((item: any) => {
                        const product = item.products;
                        const variant = item.product_variants;

                        return {
                          id: `${product.id}-${variant.id}`,
                          product: {
                            id: product.id,
                            categoryId: product.category_id,
                            name: product.name,
                            description: product.description,
                            image: product.image_url,
                            isAvailable: product.is_available,
                            isFeatured: product.is_featured,
                            variants: [],
                            addons: [],
                          },
                          variant: {
                            id: variant.id,
                            name: variant.variant_name,
                            price: variant.price,
                            isDefault: variant.is_default,
                          },
                          addons: [],
                          quantity: item.quantity,
                        };
                      });

                      dispatch({
                        type: "BULK_ADD",
                        payload: reorderedItems,
                      });

                      toast.success("Items added to cart");
                      navigate("/menu");
                    }}
                    className="text-green-600 text-sm hover:underline"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProfilePage;