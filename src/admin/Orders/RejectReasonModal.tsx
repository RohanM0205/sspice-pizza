import { useState } from "react";
import { motion } from "framer-motion";

const reasons = [
  "Out of stock",
  "Kitchen overloaded",
  "Delivery unavailable",
  "Payment issue",
  "Other",
];

const RejectReasonModal = ({ open, onClose, onSubmit }: any) => {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-card p-6 rounded-xl w-[400px] border border-border"
      >

        <h2 className="text-xl font-semibold mb-4">
          Reject Order
        </h2>

        <select
          className="w-full px-4 py-2 border border-border rounded-lg bg-secondary"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select reason</option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary"
          >
            Cancel
          </button>

          <button
            disabled={!reason}
            onClick={() => onSubmit(reason)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
          >
            Reject Order
          </button>

        </div>

      </motion.div>

    </div>
  );
};

export default RejectReasonModal;