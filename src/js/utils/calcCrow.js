/**
 * Panoutils
 */

// Converts numeric degrees to radians
function toRad(value) {
  return value * Math.PI / 180;
}

export default function (a, b) {
  const lat1 = a.lat;
  const lon1 = a.lng;
  const lat2 = b.lat;
  const lon2 = b.lng;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const c = Math.sin(dLat / 2) * Math.sin(dLat / 2)
          + Math.sin(dLon / 2) * Math.sin(dLon / 2)
          * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  const e = R * d;
  return e;
}
