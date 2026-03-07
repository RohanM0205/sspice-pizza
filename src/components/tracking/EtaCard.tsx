const EtaCard = ({ distance }: { distance: number }) => {

    const avgSpeed = 20; // km/h average delivery bike speed
  
    const calculateETA = (distanceKm: number) => {
  
      if (!distanceKm || distanceKm <= 0) {
        return 1;
      }
  
      const timeHours = distanceKm / avgSpeed;
  
      const minutes = Math.round(timeHours * 60);
  
      return Math.max(1, minutes);
    };
  
    const eta = calculateETA(distance);
  
    return (
  
      <div className="bg-card border rounded-xl p-4 mb-4 text-center">
  
        <p className="font-semibold">
          Estimated Arrival
        </p>
  
        <p className="text-xl font-bold">
  
          {distance < 0.05
            ? "Arriving now"
            : `${eta} minutes`}
  
        </p>
  
      </div>
  
    );
  
  };
  
  export default EtaCard;