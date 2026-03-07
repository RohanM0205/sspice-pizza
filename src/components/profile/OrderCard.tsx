import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  placed: "bg-yellow-500",
  preparing: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

interface Props {
  order: any;
  onOpen: (id: string) => void;
}

const OrderCard = ({ order, onOpen }: Props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onOpen(order.id)}
      className="bg-card border border-border rounded-xl p-4 flex justify-between items-center shadow-sm cursor-pointer hover:shadow-md transition"
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

        <p className="text-xs text-muted-foreground mt-1">
          Click to view items
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold mb-2">₹{order.final_amount}</p>

        <Link
          to={`/track-order?orderId=${order.id}`}
          className="text-primary text-sm hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Track
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderCard;