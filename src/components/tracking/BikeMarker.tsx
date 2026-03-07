import { Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const BikeMarker = ({ lat, lng }: any) => {

  const [position, setPosition] = useState([lat, lng]);

  useEffect(() => {

    if (!lat || !lng) return;
  
    const target = [lat, lng];
  
    const interval = setInterval(() => {
  
      setPosition((prev:any) => {
  
        const newLat = prev[0] + (target[0] - prev[0]) * 0.1;
        const newLng = prev[1] + (target[1] - prev[1]) * 0.1;
  
        return [newLat, newLng];
  
      });
  
    }, 50);
  
    return () => clearInterval(interval);
  
  }, [lat, lng]);

  return (
    <Marker
      position={position as any}
      icon={bikeIcon}
    />
  );

};

export default BikeMarker;