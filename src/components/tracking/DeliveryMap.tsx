import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline
  } from "react-leaflet";
  
  import BikeMarker from "./BikeMarker";
  
  const DeliveryMap = ({ driver, customer, restaurant }: any) => {
  
    const route = customer
      ? [
          [restaurant.lat, restaurant.lng],
          [driver.lat, driver.lng],
          [customer.lat, customer.lng]
        ]
      : [
          [restaurant.lat, restaurant.lng],
          [driver.lat, driver.lng]
        ];
  
    return (
  
      <MapContainer
        center={[driver.lat, driver.lng]}
        zoom={15}
        scrollWheelZoom={false}
  style={{
    height: "420px",
    width: "100%",
    borderRadius: "14px"
  }}
      >
  
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
  
        <Polyline
          positions={route}
          color="red"
        />
  
        <BikeMarker
          lat={driver.lat}
          lng={driver.lng}
        />
  
      </MapContainer>
  
    );
  
  };
  
  export default DeliveryMap;