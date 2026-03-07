import DeliveryOrderCard from "./DeliveryOrderCard";

interface Props {
  orders: any[];
  onMarkDelivered: (id: string) => void;
}

const AssignedOrders = ({ orders, onMarkDelivered }: Props) => {

  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground">
        No active deliveries.
      </p>
    );
  }

  return (

    <div className="space-y-6">

      {orders.map((order) => (

        <DeliveryOrderCard
          key={order.id}
          order={order}
          onMarkDelivered={onMarkDelivered}
        />

      ))}

    </div>

  );

};

export default AssignedOrders;