interface Props {
    couponCode: string;
    setCouponCode: any;
    appliedCoupon: any;
    discountAmount: number;
    couponLoading: boolean;
    onApply: () => void;
  }
  
  const CouponSection = ({
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    couponLoading,
    onApply,
  }: Props) => {
    return (
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg">Apply Coupon</h3>
  
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg"
          />
  
          <button
            type="button"
            onClick={onApply}
            disabled={couponLoading}
            className="bg-primary text-white px-4 py-3 rounded-lg font-bold"
          >
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </div>
  
        {appliedCoupon && (
          <p className="text-green-600 text-sm">
            Coupon "{appliedCoupon.code}" applied — Saved ₹{discountAmount}
          </p>
        )}
      </div>
    );
  };
  
  export default CouponSection;