import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DeliveryMap from "@/components/tracking/DeliveryMap";
import DeliveryPartnerCard from "@/components/tracking/DeliveryPartnerCard";
import OrderTimeline from "@/components/tracking/OrderTimeline";
import EtaCard from "@/components/tracking/EtaCard";

import { geocodeAddress } from "@/utils/geocodeAddress";
import { calculateDistance } from "@/utils/calculateDistance";

const TrackOrderPage = () => {

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const restaurantLocation = {
    lat: 19.2437,
    lng: 73.1355
  };

  /* -----------------------------
      Fetch Order
  ----------------------------- */

  const fetchOrder = async () => {

    if (!orderId) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers(name, phone),
        customer_addresses(address_line, city),
        admin_users(name, phone)
      `)
      .eq("id", orderId)
      .single();

    if (error || !data) {
      console.error("Failed fetching order:", error);
      return;
    }

    setOrder(data);

    const address = data.customer_addresses?.address_line;

    if (!address) return;

    try {

      const geo = await geocodeAddress(address);

      if (geo) {
        setCustomer({
          lat: geo.lat,
          lng: geo.lng
        });
      }

    } catch (err) {
      console.error("Geocode failed:", err);
    }

  };

  /* -----------------------------
      Fetch Driver Location
  ----------------------------- */

  const fetchDriverLocation = async () => {

    if (!orderId) return;

    const { data, error } = await supabase
  .from("delivery_locations")
  .select("*")
  .eq("order_id", orderId)
  .order("updated_at", { ascending: false })
  .limit(1)
  .maybeSingle();

    if (error) {
      console.error("Driver location fetch error:", error);
      return;
    }

    if (data) {
      setDriver({
        lat: data.latitude,
        lng: data.longitude
      });
    }

  };

  /* -----------------------------
      Initial Load
  ----------------------------- */

  useEffect(() => {

    fetchOrder();
    fetchDriverLocation();

  }, [orderId]);

  /* -----------------------------
      Calculate Distance
  ----------------------------- */

  const distance =
    driver && customer
      ? calculateDistance(
          driver.lat,
          driver.lng,
          customer.lat,
          customer.lng
        )
      : 0;

  /* -----------------------------
      Loading State
  ----------------------------- */

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="pt-24 text-center">
          Loading order...
        </div>
        <Footer />
      </>
    );
  }

  return (

    <>
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">

        <h1 className="text-3xl font-bold text-center mb-6">
          Track Your Order
        </h1>

        <OrderTimeline status={order.order_status} />

        {/* Delivery partner info currently limited */}
        <DeliveryPartnerCard partner={order.admin_users} />

        <EtaCard distance={distance} />

        {driver && (
          <DeliveryMap
            driver={driver}
            customer={customer}
            restaurant={restaurantLocation}
          />
        )}

      </div>

      <Footer />

    </>
  );

};

export default TrackOrderPage;