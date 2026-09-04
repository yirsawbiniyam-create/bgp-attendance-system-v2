/**
 * Geolocation fence utility for Benishangul-Gumuz Regional Police Commission HQ (Assosa)
 * Default HQ: Lat 10.0658, Lon 34.5385 (500m radius limit)
 */

export const DEFAULT_BG_POLICE_HQ = {
  latitude: 10.0658,
  longitude: 34.5385,
  name: 'የቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ዋና መስሪያ ቤት (አሶሳ)'
};

export const DEFAULT_ALLOWED_RADIUS_METERS = 500;

/**
 * Calculates distance between two GPS coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeofenceResult {
  latitude: number;
  longitude: number;
  distanceMeters: number;
  withinFence: boolean;
  accuracyMeters?: number;
  error?: string;
}

/**
 * Gets user's current coordinates and validates against HQ radius
 */
export async function verifyGeofence(
  hqLat: number = DEFAULT_BG_POLICE_HQ.latitude,
  hqLon: number = DEFAULT_BG_POLICE_HQ.longitude,
  allowedRadius: number = DEFAULT_ALLOWED_RADIUS_METERS
): Promise<GeofenceResult> {
  return new Promise((resolve) => {
    // Kilometer restriction disabled by request - default to within fence always
    if (!navigator.geolocation) {
      resolve({
        latitude: hqLat,
        longitude: hqLon,
        distanceMeters: 0,
        withinFence: true,
        error: 'የኪሎሜትር ገደብ ተነስቷል፤ ሲስተሙ በየትኛውም ቦታ ክፍት ነው'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const dist = calculateDistanceMeters(userLat, userLon, hqLat, hqLon);
        resolve({
          latitude: userLat,
          longitude: userLon,
          distanceMeters: dist,
          withinFence: true, // Always true so kilometer distance never blocks
          accuracyMeters: pos.coords.accuracy
        });
      },
      (err) => {
        resolve({
          latitude: hqLat,
          longitude: hqLon,
          distanceMeters: 0,
          withinFence: true,
          error: 'የኪሎሜትር ገደብ ተነስቷል፤ ሲስተሙ ክፍት ነው'
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  });
}
