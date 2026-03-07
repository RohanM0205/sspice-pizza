import { motion } from "framer-motion";

interface Props {
  customer: any;
  orders: any[];
  totalSpent: number;
  onLogout: () => void;
}

const ProfileCard = ({ customer, orders, totalSpent, onLogout }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 mb-10 shadow-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
          {customer?.name?.charAt(0) || "U"}
        </div>

        <div>
          <h2 className="font-bold text-lg">{customer?.name}</h2>
          <p className="text-sm text-muted-foreground">{customer?.email}</p>
          <p className="text-sm text-muted-foreground">{customer?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-xl font-bold">₹{totalSpent}</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="text-sm text-red-500 hover:underline"
      >
        Logout
      </button>
    </motion.div>
  );
};

export default ProfileCard;