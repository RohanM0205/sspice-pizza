const DeliveryPartnerCard = ({ partner }:any) => {

    if(!partner) return null;
  
    return (
  
      <div className="bg-card border rounded-xl p-4 mb-4 flex justify-between">
  
        <div>
          <p className="font-semibold">
            Delivery Partner
          </p>
  
          <p className="text-sm">
            {partner.name}
          </p>
        </div>
  
        <a
          href={`tel:${partner.phone}`}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Call
        </a>
  
      </div>
  
    );
  
  };
  
  export default DeliveryPartnerCard;