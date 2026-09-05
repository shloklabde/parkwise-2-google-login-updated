/**
 * Ola Maps Service
 * Handles browser geolocation, Ola Maps Directions API routing, and coordinate utilities.
 */

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DirectionsRoute {
  distanceMeters: number;
  durationSeconds: number;
  distanceFormatted: string;
  durationFormatted: string;
  coordinates: [number, number][]; // [lng, lat] pairs for MapLibre GeoJSON LineString
  polyline?: string;
  warnings?: string[];
}

export const OLA_MAPS_API_KEY =
  ((import.meta.env.VITE_OLA_MAPS_API_KEY as string) || '').trim();

/**
 * Request user's current geolocation one time.
 * Does NOT maintain persistent tracking (respects privacy constraint).
 */
export function getCurrentUserLocation(
  timeoutMs = 12000,
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission was denied. You can search or select a location manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000, // 1 minute cached location allowed to save battery
      },
    );
  });
}

/**
 * Decodes standard Google/Ola Maps encoded polyline string (supports 5 or 6 decimal places).
 */
export function decodePolyline(
  str: string,
  precision = 5,
): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

/**
 * Format duration in seconds to a friendly "12 mins" or "1 hr 15 mins"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '1 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${Math.max(1, mins)} min${mins > 1 ? 's' : ''}`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr ${remainingMins} min`;
}

/**
 * Format distance in meters to "450 m" or "3.2 km"
 */
export function formatDistanceMeters(meters: number): string {
  if (!meters || meters <= 0) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Fetch directions from Ola Maps Directions API
 * Origin and Destination format: "lat,lng"
 */
export async function getOlaDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<DirectionsRoute> {
  if (!origin || !destination) {
    throw new Error('Valid origin and destination coordinates are required.');
  }

  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${destination.lat},${destination.lng}`;
  const apiKey = OLA_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Ola Maps API key (VITE_OLA_MAPS_API_KEY) is missing.');
  }

  // Construct URL. Ola Directions API accepts POST or GET with query params
  const url = `https://api.olamaps.io/routing/v1/directions?origin=${encodeURIComponent(
    originStr,
  )}&destination=${encodeURIComponent(destinationStr)}&mode=driving&api_key=${apiKey}`;

  let data: any = null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // If POST is not allowed or fails, attempt GET
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!getResponse.ok) {
        throw new Error(`Ola Maps error: ${getResponse.status} ${getResponse.statusText}`);
      }
      data = await getResponse.json();
    } else {
      data = await response.json();
    }
  } catch (err) {
    console.warn('Direct Ola Maps Directions API call failed or hit CORS, trying fallback route:', err);
    // Fallback: Compute direct route geometry so the user gets clean visual directions and ETA
    return createDirectFallbackRoute(origin, destination);
  }

  // Check routes response
  const route = data?.routes?.[0];
  if (!route) {
    return createDirectFallbackRoute(origin, destination);
  }

  // Ola directions response has route.legs[0].distance or route.distance
  const leg = route.legs?.[0];
  const distanceMeters = Number(leg?.distance ?? route.distance) || 0;
  const durationSeconds = Number(leg?.duration ?? route.duration) || 0;

  let coordinates: [number, number][] = [];

  // Check for polyline in overview_polyline or geometry
  const polylineString =
    typeof route.overview_polyline === 'string'
      ? route.overview_polyline
      : typeof route.geometry === 'string'
      ? route.geometry
      : undefined;

  if (polylineString) {
    try {
      // Ola Maps encoded polyline typically uses 5 decimal places (standard Google format)
      coordinates = decodePolyline(polylineString, 5);
      if (coordinates.length === 0) {
        coordinates = decodePolyline(polylineString, 6);
      }
    } catch {
      coordinates = [];
    }
  } else if (route.geometry?.coordinates && Array.isArray(route.geometry.coordinates)) {
    coordinates = route.geometry.coordinates;
  }

  // If decoding produced no valid line, use start & end points
  if (coordinates.length < 2) {
    coordinates = [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ];
  }

  return {
    distanceMeters,
    durationSeconds,
    distanceFormatted: formatDistanceMeters(distanceMeters),
    durationFormatted: formatDuration(durationSeconds),
    coordinates,
    polyline: polylineString,
  };
}

/**
 * Creates a straight-line fallback route with realistic driving distance & duration
 * if the external routing service is unreachable or rate-limited.
 */
function createDirectFallbackRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): DirectionsRoute {
  const lat1 = origin.lat;
  const lon1 = origin.lng;
  const lat2 = destination.lat;
  const lon2 = destination.lng;

  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Road factor in urban cities ~1.35x
  const roadDistanceMeters = Math.round(straightKm * 1.35 * 1000);
  // Average urban speed ~25 km/h -> ~7 m/s
  const durationSeconds = Math.round(roadDistanceMeters / 7);

  // Generate intermediate waypoint curve for realistic map path
  const midLat = (lat1 + lat2) / 2 + (lon2 - lon1) * 0.08;
  const midLng = (lon1 + lon2) / 2 - (lat2 - lat1) * 0.08;

  const coordinates: [number, number][] = [
    [lon1, lat1],
    [midLng, midLat],
    [lon2, lat2],
  ];

  return {
    distanceMeters: roadDistanceMeters,
    durationSeconds,
    distanceFormatted: formatDistanceMeters(roadDistanceMeters),
    durationFormatted: formatDuration(durationSeconds),
    coordinates,
    warnings: ['Simulated direct route'],
  };
}
