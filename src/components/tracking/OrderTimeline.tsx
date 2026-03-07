const steps = [
    "placed",
    "preparing",
    "out_for_delivery",
    "delivered"
  ];
  
  const OrderTimeline = ({status}:any) => {
  
    const index = steps.indexOf(status);
  
    return (
  
      <div className="flex justify-between mb-10">
  
        {steps.map((s,i)=>(
          <div key={s} className="text-center flex-1">
  
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white ${
                i<=index ? "bg-green-600":"bg-gray-400"
              }`}
            >
              ✓
            </div>
  
            <p className="text-xs mt-2">
              {s.replace(/_/g, " ")}
            </p>
  
          </div>
        ))}
  
      </div>
  
    );
  
  };
  
  export default OrderTimeline;