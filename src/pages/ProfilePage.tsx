import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ProfileCard from "@/components/profile/ProfileCard";
import OrderCard from "@/components/profile/OrderCard";
import OrderDetailsModal from "@/components/profile/OrderDetailsModal";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

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

    setLoading(false);
  };

  const openOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    setLoadingItems(true);

    const { data } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        products (name, image_url),
        product_variants (variant_name),
        order_item_addons (
          price,
          product_addons (name)
        )
      `)
      .eq("order_id", order.id);

    if (data) {
      setOrderItems(data);
    }

    setLoadingItems(false);
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

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <ProfileCard
          customer={customer}
          orders={orders}
          totalSpent={totalSpent}
          onLogout={signOut}
        />

        {/* Orders */}
        <h2 className="text-2xl font-bold mb-6">
          Order History
        </h2>

        {loading && (
          <p className="text-muted-foreground">
            Loading orders...
          </p>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-10 border rounded-xl">
            <p className="text-lg mb-2">
              🍕 You haven't ordered yet
            </p>

            <Link
              to="/menu"
              className="text-primary font-semibold"
            >
              Browse Menu
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpen={() => openOrderDetails(order)}
            />
          ))}
        </div>

      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        items={orderItems}
        loading={loadingItems}
        onClose={() => setSelectedOrder(null)}
      />

      <Footer />
    </>
  );
};

export default ProfilePage;