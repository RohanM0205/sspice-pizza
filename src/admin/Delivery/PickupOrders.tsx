import DeliveryOrderCard from "./DeliveryOrderCard";

interface Props {
  orders: any[];
  onStartDelivery: (id: string) => void;
}

const PickupOrders = ({ orders, onStartDelivery }: Props) => {

  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground">
        No pickup orders available.
      </p>
    );
  }

  return (

    <div className="space-y-6">

      {orders.map((order) => (

        <DeliveryOrderCard
          key={order.id}
          order={order}
          onStartDelivery={onStartDelivery}
        />

      ))}

    </div>

  );

};

export default PickupOrders;