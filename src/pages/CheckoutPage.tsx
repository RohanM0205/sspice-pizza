import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

const CheckoutPage = () => {
  const { state, totalAmount, deliveryCharge, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // ✅ Coupon States (NEW)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Kalyan",
    paymentMethod: "cod" as "cod" | "razorpay",
  });

  // 🔹 Load customer + saved addresses if logged in
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (customer) {
        setCustomerId(customer.id);
        setForm((prev) => ({
          ...prev,
          name: customer.name || "",
          phone: customer.phone || "",
        }));

        const { data: addresses } = await supabase
          .from("customer_addresses")
          .select("*")
          .eq("customer_id", customer.id);

        if (addresses) setSavedAddresses(addresses);
      }
    };

    loadCustomerData();
  }, [user]);

  // ✅ Coupon Apply Logic (NEW)
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Enter coupon code");
      return;
    }

    try {
      setCouponLoading(true);

      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        toast.error("Invalid coupon");
        return;
      }

      const now = new Date();
      const expiry = new Date(coupon.expiry_date);

      if (expiry < now) {
        toast.error("Coupon expired");
        return;
      }

      if (totalAmount < coupon.min_order_amount) {
        toast.error(`Minimum order ₹${coupon.min_order_amount} required`);
        return;
      }

      let discount = 0;

      if (coupon.discount_type === "percentage") {
        discount = (totalAmount * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }

      setAppliedCoupon(coupon);
      setDiscountAmount(discount);

      toast.success("Coupon applied successfully!");
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      toast.error("Please fill in name and phone");
      return;
    }

    if (state.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      let finalCustomerId = customerId;
      let addressId = selectedAddressId;

      // 🔹 If guest → create new customer
      if (!user) {
        const { data: newCustomer, error } = await supabase
          .from("customers")
          .insert([{ name: form.name, phone: form.phone }])
          .select()
          .single();

        if (error) throw error;
        finalCustomerId = newCustomer.id;
      }

      // 🔹 If no saved address selected → create new one
      if (!selectedAddressId) {
        if (!form.address) {
          toast.error("Please enter address");
          return;
        }

        const { data: newAddress, error } = await supabase
          .from("customer_addresses")
          .insert([
            {
              customer_id: finalCustomerId,
              address_line: form.address,
              city: form.city,
              state: "Maharashtra",
            },
          ])
          .select()
          .single();

        if (error) throw error;

        addressId = newAddress.id;
      }

      // ✅ Updated Final Amount (WITH DISCOUNT)
      const finalAmount =
        totalAmount + deliveryCharge - discountAmount;

      // 🔹 Insert Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: RESTAURANT_ID,
            customer_id: finalCustomerId,
            address_id: addressId,
            total_amount: totalAmount,
            delivery_charge: deliveryCharge,
            discount_amount: discountAmount, // ✅ NEW
            final_amount: finalAmount,
            payment_method: form.paymentMethod,
            payment_status: "pending",
            order_status: "placed",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 🔹 Insert Order Items
      const orderItemsPayload = state.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // 🔹 Order History
      await supabase.from("order_status_history").insert([
        {
          order_id: order.id,
          status: "placed",
        },
      ]);

      dispatch({ type: "CLEAR_CART" });

      toast.success("Order placed successfully!");
      navigate(`/order-success?orderId=${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Your cart is empty
            </p>
            <a href="/menu" className="text-primary hover:underline">
              Browse Menu
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="pt-20 pb-24">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-center mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

              {/* Delivery Section (UNCHANGED) */}
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold">
                  Delivery Details
                </h3>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg bg-secondary"
                />

                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg bg-secondary"
                />

                {savedAddresses.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">
                      Saved Addresses
                    </p>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() =>
                          setSelectedAddressId(addr.id)
                        }
                        className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                          selectedAddressId === addr.id
                            ? "border-primary"
                            : "border-border"
                        }`}
                      >
                        {addr.address_line}, {addr.city}
                      </div>
                    ))}
                  </div>
                )}

                {!selectedAddressId && (
                  <textarea
                    placeholder="Full Address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-secondary"
                  />
                )}
              </div>

              {/* ✅ Coupon Section */}
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg">
                  Apply Coupon
                </h3>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value)
                    }
                    className="flex-1 px-4 py-3 border rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-primary text-white px-4 py-3 rounded-lg font-bold"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="text-green-600 text-sm">
                    Coupon "{appliedCoupon.code}" applied —
                    Saved ₹{discountAmount}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold"
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order — ₹${totalAmount + deliveryCharge - discountAmount}`}
              </button>
            </form>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card border rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">
                  Order Summary
                </h3>

                {state.items.map((item) => {
                  const addonTotal = item.addons.reduce(
                    (s, a) => s + a.price,
                    0
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm mb-2"
                    >
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        ₹{(item.variant.price + addonTotal) *
                          item.quantity}
                      </span>
                    </div>
                  );
                })}

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{deliveryCharge}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>
                      ₹{totalAmount + deliveryCharge - discountAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default CheckoutPage;