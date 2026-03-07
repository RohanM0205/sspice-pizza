export const getRoute = async (
    start:any,
    end:any
  ) => {
  
    const key = import.meta.env.VITE_GOOGLE_MAP_KEY;
  
    const url =
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${key}`;
  
    const res = await fetch(url);
    const data = await res.json();
  
    return data.routes?.[0]?.overview_polyline?.points;
  };