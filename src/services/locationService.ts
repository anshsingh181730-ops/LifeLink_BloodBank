import { Location } from '../types';

export interface GeolocationResult {
  location: Location;
  isHighAccuracy: boolean;
  accuracyMeters?: number;
}

export interface GeocodeSuggestion {
  displayName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

// Simple in-memory cache to prevent redundant Nominatim requests
const geocodeCache = new Map<string, GeocodeSuggestion[]>();
const reverseCache = new Map<string, { address: string; city: string }>();

/**
 * Capture user's real geolocation using the browser's Geolocation API.
 * Uses high accuracy with a 10s timeout.
 */
export async function captureBrowserLocation(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const timestamp = position.timestamp;

        // Perform reverse geocoding via OpenStreetMap Nominatim
        let address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        let city = 'Detected Location';

        try {
          const rev = await reverseGeocodeNominatim(lat, lng);
          address = rev.address;
          city = rev.city;
        } catch (err) {
          console.warn('Nominatim reverse geocode fallback:', err);
        }

        resolve({
          location: {
            address,
            city,
            lat,
            lng,
            source: 'browser',
            accuracy,
            timestamp
          },
          isHighAccuracy: accuracy <= 100,
          accuracyMeters: Math.round(accuracy)
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied by the user.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please enter your location manually.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Reverse geocode lat/lng to readable address and city using OpenStreetMap Nominatim.
 */
export async function reverseGeocodeNominatim(
  lat: number,
  lng: number
): Promise<{ address: string; city: string }> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)!;
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'en'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = await response.json();
  const addr = data.address || {};

  const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || '';
  const road = addr.road || addr.pedestrian || '';
  const city = addr.city || addr.town || addr.municipality || addr.district || addr.state_district || 'Delhi NCR';
  const state = addr.state || '';

  const parts = [neighborhood, road, city, state].filter(Boolean);
  const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  const result = {
    address: formattedAddress,
    city: city || 'Delhi NCR'
  };

  reverseCache.set(cacheKey, result);
  return result;
}

/**
 * Geocode text query (city or street address) to coordinates using OpenStreetMap Nominatim.
 */
export async function geocodeAddressNominatim(query: string): Promise<GeocodeSuggestion[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (geocodeCache.has(cleanQuery)) {
    return geocodeCache.get(cleanQuery)!;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(cleanQuery)}&limit=5&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'en'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = await response.json();

  const suggestions: GeocodeSuggestion[] = data.map((item: any) => {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || 'Delhi NCR';
    return {
      displayName: item.display_name,
      address: item.display_name.split(',').slice(0, 3).join(', ').trim(),
      city,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    };
  });

  geocodeCache.set(cleanQuery, suggestions);
  return suggestions;
}

/**
 * Calculate Haversine distance in km between two lat/lng points.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
