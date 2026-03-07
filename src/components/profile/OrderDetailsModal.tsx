interface Props {
    order: any;
    items: any[];
    loading: boolean;
    onClose: () => void;
  }
  
  const statusSteps = [
    "placed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];
  
  const stepLabels: Record<string, string> = {
    placed: "Placed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };
  
  const OrderDetailsModal = ({
    order,
    items,
    loading,
    onClose,
  }: Props) => {
    if (!order) return null;
  
    const currentStep = statusSteps.indexOf(order.order_status);
  
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
  
        <div className="bg-card w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
  
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
  
            <div>
              <h2 className="text-xl font-bold">
                Order #{order.id.slice(0, 8)}
              </h2>
  
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
  
            <button
              onClick={onClose}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Close
            </button>
          </div>
  
          {/* Timeline */}
          <div className="mb-8">
  
            <div className="flex items-center justify-between mb-2">
  
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
  
                  <div
                    className={`w-4 h-4 rounded-full ${
                      i <= currentStep
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
  
                  <span
                    className={`text-xs mt-2 ${
                      i <= currentStep
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {stepLabels[step]}
                  </span>
  
                </div>
              ))}
  
            </div>
  
            {/* Progress Line */}
            <div className="h-[2px] bg-border relative">
              <div
                className="absolute top-0 left-0 h-[2px] bg-green-500"
                style={{
                  width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>
  
          </div>
  
          {/* Items */}
          <h3 className="font-semibold mb-4">
            Order Items
          </h3>
  
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading items...
            </p>
          )}
  
          {!loading &&
            items.map((item, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-4 mb-4 bg-muted/30"
              >
  
                <div className="flex justify-between items-start mb-2">
  
                  <div>
  
                    <p className="font-semibold">
                      🍕 {item.products?.name}
                    </p>
  
                    <p className="text-sm text-muted-foreground">
                      Size: {item.product_variants?.variant_name}
                    </p>
  
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
  
                  </div>
  
                  <p className="font-bold">
                    ₹{item.price}
                  </p>
  
                </div>
  
                {item.order_item_addons?.length > 0 && (
                  <div className="text-sm mt-2">
  
                    <p className="font-medium">
                      Addons
                    </p>
  
                    <ul className="ml-4 list-disc text-muted-foreground">
  
                      {item.order_item_addons.map(
                        (addon: any, j: number) => (
                          <li key={j}>
                            {addon.product_addons?.name} (+₹{addon.price})
                          </li>
                        )
                      )}
  
                    </ul>
  
                  </div>
                )}
  
              </div>
            ))}
  
        </div>
      </div>
    );
  };
  
  export default OrderDetailsModal;