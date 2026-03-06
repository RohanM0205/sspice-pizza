const OrderSummary = ({
    items,
    totalAmount,
    deliveryCharge,
    discountAmount,
  }: any) => {
    return (
      <div className="lg:col-span-2">
        <div className="bg-card border rounded-xl p-6 sticky top-24">
  
          <h3 className="text-lg font-bold mb-4">
            Order Summary
          </h3>
  
          {items.map((item: any) => {
            const addonTotal = item.addons.reduce(
              (s: number, a: any) => s + a.price,
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
    );
  };
  
  export default OrderSummary;