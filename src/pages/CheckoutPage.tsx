import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import DeliveryForm from "@/components/checkout/DeliveryForm";
import CouponSection from "@/components/checkout/CouponSection";
import OrderSummary from "@/components/checkout/OrderSummary";

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

const CheckoutPage = () => {
  const { state, totalAmount, deliveryCharge, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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

  /* =========================
     Load Customer + Addresses
  ========================= */

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!user) return;

      const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error) {
        console.error("Customer fetch error:", error);
        return;
      }

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

  /* =========================
     Apply Coupon
  ========================= */

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

      const expiry = new Date(coupon.expiry_date);
      if (expiry < new Date()) {
        toast.error("Coupon expired");
        return;
      }

      if (totalAmount < coupon.min_order_amount) {
        toast.error(`Minimum order ₹${coupon.min_order_amount}`);
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

      toast.success("Coupon applied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  /* =========================
     Submit Order
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      toast.error("Please enter name and phone");
      return;
    }

    if (state.items.length === 0) {
      toast.error("Cart empty");
      return;
    }

    try {
      setLoading(true);

      let finalCustomerId = customerId;
      let addressId = selectedAddressId;

      /* ---------- Guest Customer ---------- */

      if (!user) {
        const { data, error } = await supabase
          .from("customers")
          .insert([{ name: form.name, phone: form.phone }])
          .select()
          .single();

        if (error) throw error;

        finalCustomerId = data.id;
      }

      /* ---------- Address ---------- */

      if (!selectedAddressId) {
        if (!form.address) {
          toast.error("Please enter delivery address");
          return;
        }

        const { data, error } = await supabase
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

        addressId = data.id;
      }

      /* ---------- Final Amount ---------- */

      const finalAmount = totalAmount + deliveryCharge - discountAmount;

      /* ---------- Create Order ---------- */

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: RESTAURANT_ID,
            customer_id: finalCustomerId,
            address_id: addressId,
            total_amount: totalAmount,
            delivery_charge: deliveryCharge,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            payment_method: form.paymentMethod,
            payment_status: "pending",
            order_status: "placed",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      /* ---------- Insert Order Items ---------- */

      const orderItemsPayload = state.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload)
        .select();

      if (itemsError) throw itemsError;

      /* ---------- Insert Addons ---------- */

      const addonRows: any[] = [];

      insertedItems.forEach((orderItem: any) => {
        const cartItem = state.items.find(
          (i) =>
            i.product.id === orderItem.product_id &&
            i.variant.id === orderItem.variant_id
        );

        if (!cartItem) return;

        cartItem.addons.forEach((addon) => {
          addonRows.push({
            order_item_id: orderItem.id,
            addon_id: addon.id,
            price: addon.price,
          });
        });
      });

      if (addonRows.length > 0) {
        const { error: addonError } = await supabase
          .from("order_item_addons")
          .insert(addonRows);

        if (addonError) {
          console.error("Addon insert error:", addonError);
        }
      }

      /* ---------- Order History ---------- */

      await supabase.from("order_status_history").insert([
        {
          order_id: order.id,
          status: "placed",
        },
      ]);

      /* ---------- Clear Cart ---------- */

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

  /* =========================
     UI
  ========================= */

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

              <DeliveryForm
                form={form}
                setForm={setForm}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
              />

              <CouponSection
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
                couponLoading={couponLoading}
                onApply={handleApplyCoupon}
              />

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

            <OrderSummary
              items={state.items}
              totalAmount={totalAmount}
              deliveryCharge={deliveryCharge}
              discountAmount={discountAmount}
            />

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default CheckoutPage;