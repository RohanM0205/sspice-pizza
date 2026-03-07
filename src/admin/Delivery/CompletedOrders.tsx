import DeliveryOrderCard from "./DeliveryOrderCard";

interface Props {
  orders: any[];
  onCollectCash: (id: string) => void;
}

const CompletedOrders = ({ orders, onCollectCash }: Props) => {

  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground">
        No completed orders yet.
      </p>
    );
  }

  return (

    <div className="space-y-6">

      {orders.map((order) => (

        <DeliveryOrderCard
          key={order.id}
          order={order}
          onCollectCash={onCollectCash}
        />

      ))}

    </div>

  );

};

export default CompletedOrders;