import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  order: any;
  type: "pending" | "accepted" | "rejected";
  onAccept?: (id: string) => void;
  onReject?: (order: any) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onCashCollected?: (id: string) => void;
  onAssignDelivery?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  placed: "bg-yellow-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

const paymentColors: Record<string, string> = {
  paid: "bg-green-600",
  pending: "bg-yellow-500",
  failed: "bg-red-600",
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const OrderCard = ({
  order,
  type,
  onAccept,
  onReject,
  onUpdateStatus,
  onCashCollected,
  onAssignDelivery,
}: Props) => {

  const [seconds, setSeconds] = useState(0);

  /* -----------------------------
      Timer Logic
  ----------------------------- */

  useEffect(() => {

    const calculateSeconds = () => {

      const start = new Date(order.created_at).getTime();

      if (order.order_status === "delivered" || order.order_status === "cancelled") {

        const end = new Date(
          order.completed_at ||
          order.rejected_at ||
          order.updated_at
        ).getTime();

        return Math.floor((end - start) / 1000);
      }

      return Math.floor((Date.now() - start) / 1000);
    };

    const value = calculateSeconds();

    if (!isNaN(value)) {
      setSeconds(value);
    }

    if (order.order_status === "delivered" || order.order_status === "cancelled")
      return;

    const interval = setInterval(() => {
      const value = calculateSeconds();
      if (!isNaN(value)) setSeconds(value);
    }, 1000);

    return () => clearInterval(interval);

  }, [order]);

  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  /* -----------------------------
      Priority Colors
  ----------------------------- */

  const getAgeColor = () => {
    if (order.order_status === "delivered") return "text-green-400";
    if (minutes < 5) return "text-green-400";
    if (minutes < 15) return "text-yellow-400";
    return "text-red-500";
  };

  const getPriorityBorder = () => {
    if (minutes < 5) return "border-green-400/20";
    if (minutes < 15) return "border-yellow-400/30";
    return "border-red-500/50";
  };

  const getGlow = () => {
    if (minutes >= 15) return "shadow-red-500/20";
    if (minutes >= 5) return "shadow-yellow-400/10";
    return "shadow-green-400/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-card border ${getPriorityBorder()} rounded-xl p-6 shadow-md ${getGlow()} hover:shadow-xl transition`}
    >

      {/* HEADER */}

      <div className="flex justify-between items-start mb-5">

        <div>

          <h3 className="font-semibold text-lg tracking-wide">
            🍕 Order #{order.id.slice(0,8)}
          </h3>

          <p className="text-sm text-muted-foreground">
            {order.customers?.name} • {order.customers?.phone}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            📍 {order.customer_addresses?.address_line},{" "}
            {order.customer_addresses?.city}
          </p>

          {/* DELIVERY ASSIGNED */}

          {order.delivery && (
  <p className="text-xs text-green-400 mt-1">
    🚚 Delivery: {order.delivery.name || order.delivery.email}
  </p>
)}

          {/* TIMER */}

          <motion.p
            key={seconds}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className={`text-xs mt-1 font-semibold ${getAgeColor()}`}
          >
            ⏱ {minutes}:{sec.toString().padStart(2,"0")} mins
          </motion.p>

        </div>

        <div className="flex flex-col items-end gap-2">

          <span
            className={`px-3 py-1 text-white text-xs rounded-full ${
              statusColors[order.order_status]
            }`}
          >
            {order.order_status.replaceAll("_"," ")}
          </span>

          <span
            className={`px-3 py-1 text-white text-xs rounded-full ${
              paymentColors[order.payment_status]
            }`}
          >
            {order.payment_method?.toUpperCase()} • {order.payment_status}
          </span>

        </div>

      </div>

      {/* ORDER TIMELINE */}

      <div className="bg-secondary/30 border border-border rounded-lg p-3 mb-5 text-xs space-y-1">

        <p>Placed: {formatTime(order.created_at)}</p>

        {order.accepted_at && (
          <p>Accepted: {formatTime(order.accepted_at)}</p>
        )}

        {order.dispatched_at && (
          <p>Dispatched: {formatTime(order.dispatched_at)}</p>
        )}

        {order.completed_at && (
          <p className="text-green-400">
            Completed: {formatTime(order.completed_at)}
          </p>
        )}

        {order.rejected_at && (
          <p className="text-red-400">
            Rejected: {formatTime(order.rejected_at)}
          </p>
        )}

        {(order.completed_at || order.rejected_at) && (
          <p className="text-primary mt-1 font-medium">
            Total Time: {minutes}m {sec}s
          </p>
        )}

      </div>

      {/* ITEMS */}

      <div className="space-y-4 mb-5">

        {order.order_items?.map((item:any)=>(

          <div
            key={item.id}
            className="bg-secondary/40 rounded-lg p-3 border border-border"
          >

            <div className="flex justify-between font-medium text-sm">

              <span>
                {item.quantity} × {item.products?.name}
              </span>

              <span>
                ₹{item.price * item.quantity}
              </span>

            </div>

            {item.product_variants && (
              <p className="text-xs text-muted-foreground ml-2 mt-1">
                Size: {item.product_variants.variant_name}
              </p>
            )}

            {item.order_item_addons?.length > 0 && (

              <div className="ml-2 mt-1 space-y-1">

                {item.order_item_addons.map((addon:any,i:number)=>(

                  <p
                    key={i}
                    className="text-xs text-muted-foreground"
                  >
                    + {addon.product_addons?.name}
                  </p>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

      {/* TOTALS */}

      <div className="grid grid-cols-2 text-sm border-t border-border pt-3 mt-4 gap-y-1">

        <span className="text-muted-foreground">Subtotal</span>
        <span className="text-right">₹{order.total_amount}</span>

        {order.discount_amount > 0 && (
          <>
            <span className="text-green-400">Discount</span>
            <span className="text-green-400 text-right">
              -₹{order.discount_amount}
            </span>
          </>
        )}

        <span className="text-muted-foreground">Delivery</span>
        <span className="text-right">₹{order.delivery_charge}</span>

        <span className="font-semibold mt-1">Total</span>
        <span className="font-semibold text-right mt-1 text-primary">
          ₹{order.final_amount}
        </span>

      </div>

      {/* ACTIONS */}

      <div className="flex gap-3 mt-6 flex-wrap">

        {type === "pending" && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onAccept?.(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Accept
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onReject?.(order)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Reject
            </motion.button>
          </>
        )}

        {/* ASSIGN DELIVERY */}

        {type === "accepted" &&
          order.order_status === "preparing" &&
          !order.delivery_person_id && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onAssignDelivery?.(order.id)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Assign Delivery
            </motion.button>
        )}

        {/* DISPATCH */}

        {type === "accepted" &&
          order.order_status === "preparing" &&
          order.delivery_person_id && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                onUpdateStatus?.(order.id,"out_for_delivery")
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Dispatch
            </motion.button>
        )}

        {type === "accepted" && order.order_status === "out_for_delivery" && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              onUpdateStatus?.(order.id,"delivered")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Delivered
          </motion.button>
        )}

        {/* COD Cash Collection */}

        {order.payment_method === "cod" &&
          order.payment_status === "pending" &&
          order.order_status === "delivered" && (

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onCashCollected?.(order.id)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Cash Collected
            </motion.button>

        )}

        {order.order_status === "delivered" &&
          order.payment_status === "paid" && (
            <span className="text-green-400 text-sm font-medium">
              Completed • Paid
            </span>
        )}

        {type === "rejected" && (
          <span className="text-red-400 text-sm">
            Reason: {order.rejection_reason || "Not specified"}
          </span>
        )}

      </div>

    </motion.div>
  );
};

export default OrderCard;