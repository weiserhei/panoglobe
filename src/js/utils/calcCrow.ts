/**
 * Panoutils
 */

// Converts numeric degrees to radians
function toRad(value: number): number {
    return (value * Math.PI) / 180;
}

export default function (a: Coordinate, b: Coordinate): number {
    const lat1 = Number(a.lat);
    const lon1 = Number(a.lng);
    const lat2 = Number(b.lat);
    const lon2 = Number(b.lng);
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const c =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2));
    const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
    const e = R * d;
    return e;
}
