import { geolocation } from "@vercel/functions";

const locationsData = [
  { id: 1, latitude: 34.04677624710386, longitude: -118.262972794232 },
  { id: 2, latitude: 33.082276406297, longitude: -117.26650509742225 },
  { id: 3, latitude: 47.614824486545736, longitude: -122.33964785782985 },
  { id: 4, latitude: 39.74772132744277, longitude: -104.98947169919487 },
  { id: 5, latitude: 38.88047980986965, longitude: -77.11097442994593 },
  { id: 6, latitude: 39.041445408733466, longitude: -94.5923468712363 },
];

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request) {
  const { latitude, longitude } = geolocation(request);

  if (!latitude || !longitude) {
    return Response.json({ ids: locationsData.map((l) => l.id) });
  }

  const userLat = parseFloat(latitude);
  const userLng = parseFloat(longitude);

  const ids = [...locationsData]
    .sort(
      (a, b) =>
        haversineMiles(userLat, userLng, a.latitude, a.longitude) -
        haversineMiles(userLat, userLng, b.latitude, b.longitude),
    )
    .map((l) => l.id);

  return Response.json({ ids });
}
