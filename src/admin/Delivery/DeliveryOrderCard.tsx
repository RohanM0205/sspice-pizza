import { motion } from "framer-motion";
import { Phone, MapPin, Bike, CheckCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  order: any;
  onStartDelivery?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onCollectCash?: (id: string) => void;
}

const paymentColors: Record<string, string> = {
  paid: "bg-green-600",
  pending: "bg-yellow-500",
  failed: "bg-red-600",
};

const DeliveryOrderCard = ({
  order,
  onStartDelivery,
  onMarkDelivered,
  onCollectCash,
}: Props) => {

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    const calculateSeconds = () => {

      const start = new Date(order.created_at).getTime();

      if (order.order_status === "delivered") {

        const end = new Date(order.completed_at).getTime();

        return Math.floor((end - start) / 1000);
      }

      return Math.floor((Date.now() - start) / 1000);
    };

    const value = calculateSeconds();

    if (!isNaN(value)) setSeconds(value);

    if (order.order_status === "delivered") return;

    const interval = setInterval(() => {

      const value = calculateSeconds();

      if (!isNaN(value)) setSeconds(value);

    }, 1000);

    return () => clearInterval(interval);

  }, [order]);

  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-xl transition"
    >

      {/* HEADER */}

      <div className="flex justify-between items-start mb-4">

        <div>

          <h3 className="font-semibold text-lg">
            {order.customers?.name}
          </h3>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone size={14} />
            {order.customers?.phone}
          </p>

        </div>

        <div className="text-xs text-muted-foreground">
          ⏱ {minutes}:{sec.toString().padStart(2,"0")}
        </div>

      </div>

      {/* ADDRESS */}

      <div className="flex items-start gap-2 text-sm mb-4">

        <MapPin size={16} className="text-primary mt-[2px]" />

        <p className="text-muted-foreground">
          {order.customer_addresses?.address_line},{" "}
          {order.customer_addresses?.city}
        </p>

      </div>

      {/* ITEMS */}

      <div className="space-y-1 mb-4 text-sm">

        {order.order_items?.map((item:any)=>(

          <div
            key={item.id}
            className="flex justify-between text-muted-foreground"
          >

            <span>
              {item.quantity} × {item.products?.name}
            </span>

            <span>
              ₹{item.price * item.quantity}
            </span>

          </div>

        ))}

      </div>

      {/* TOTAL */}

      <div className="flex justify-between border-t border-border pt-3 mb-4 font-medium">

        <span>Total</span>

        <span className="text-primary">
          ₹{order.final_amount}
        </span>

      </div>

      {/* PAYMENT BADGE */}

      <div className="flex items-center gap-3 mb-4">

        <span
          className={`px-3 py-1 text-white text-xs rounded-full ${
            paymentColors[order.payment_status]
          }`}
        >
          {order.payment_method?.toUpperCase()} • {order.payment_status}
        </span>

        {order.payment_method === "cod" && (

          <span className="flex items-center gap-1 text-xs text-orange-400">

            <Wallet size={12} />

            COD ₹{order.final_amount}

          </span>

        )}

      </div>

      {/* ACTIONS */}

      <div className="flex gap-3 flex-wrap">

        {/* START DELIVERY */}

        {order.order_status === "preparing" && (

          <button
            onClick={() => onStartDelivery?.(order.id)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Bike size={16} />
            Start Delivery
          </button>

        )}

        {/* MARK DELIVERED */}

        {order.order_status === "out_for_delivery" && (

          <button
            onClick={() => onMarkDelivered?.(order.id)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle size={16} />
            Mark Delivered
          </button>

        )}

        {/* COD CASH COLLECTION */}

        {order.payment_method === "cod" &&
         order.payment_status === "pending" &&
         order.order_status === "delivered" && (

          <button
            onClick={() => onCollectCash?.(order.id)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <Wallet size={16} />
            Collect Cash
          </button>

        )}

        {/* COMPLETED */}

        {order.order_status === "delivered" &&
         order.payment_status === "paid" && (

          <span className="text-green-500 flex items-center gap-2 text-sm font-medium">
            <CheckCircle size={16} />
            Completed • Paid
          </span>

        )}

      </div>

    </motion.div>

  );
};

export default DeliveryOrderCard;