import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Bike, Mail, User, X } from "lucide-react";

interface Props {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignDeliveryModal = ({ open, orderId, onClose, onAssigned }: Props) => {
  const [deliveryUsers, setDeliveryUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchDeliveryUsers = async () => {
      const { data, error } = await supabase
        .from("admin_users_with_profile")
        .select("id, name, email")
        .eq("role", "delivery")
        .eq("is_active", true);

      if (error) {
        toast.error("Failed loading delivery staff");
      } else {
        setDeliveryUsers(data || []);
      }
    };

    fetchDeliveryUsers();
  }, [open]);

  const assignDelivery = async (deliveryId: string) => {
    if (!orderId) return;

    setLoading(true);

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_person_id: deliveryId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    setLoading(false);

    if (error) {
      toast.error("Failed assigning delivery");
    } else {
      toast.success("Delivery assigned successfully");
      onAssigned();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* MODAL */}

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card border border-border shadow-2xl rounded-2xl w-[420px] max-h-[520px] p-6"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="bg-primary/20 p-2 rounded-lg">
                  <Bike className="text-primary" size={20} />
                </div>

                <h2 className="text-lg font-semibold">
                  Assign Delivery Partner
                </h2>

              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-muted transition"
              >
                <X size={18} />
              </button>

            </div>

            {/* LIST */}

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">

              {deliveryUsers.map((user, index) => (

                <motion.button
                  key={user.id}
                  disabled={loading}
                  onClick={() => assignDelivery(user.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left p-4 rounded-xl border border-border bg-secondary/40 hover:bg-primary/10 hover:border-primary/40 transition-all flex items-center gap-3 group"
                >

                  {/* AVATAR */}

                  <div className="bg-primary/20 text-primary p-2 rounded-full">
                    <User size={16} />
                  </div>

                  {/* INFO */}

                  <div className="flex-1">

                    <p className="font-medium">
                      {user.name || "Delivery Partner"}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </p>

                  </div>

                  {/* ACTION */}

                  <div className="text-xs text-muted-foreground group-hover:text-primary">
                    Assign
                  </div>

                </motion.button>

              ))}

              {deliveryUsers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  🚫 No delivery staff available
                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="mt-6 pt-4 border-t border-border flex justify-end">

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition text-sm"
              >
                Cancel
              </button>

            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignDeliveryModal;