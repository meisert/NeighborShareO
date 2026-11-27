// Utility for calculating distance between Austin area neighborhoods and zip codes

interface GeoCoord {
  lat: number;
  lng: number;
}

export const AUSTIN_ZIP_COORDS: Record<string, GeoCoord> = {
  '78748': { lat: 30.177, lng: -97.832 }, // South Austin / Slaughter / Manchaca
  '78745': { lat: 30.207, lng: -97.798 }, // Westgate / St. Elmo (~2.8 mi from 78748)
  '78749': { lat: 30.222, lng: -97.865 }, // Maple Run / Sendera (~3.6 mi from 78748)
  '78739': { lat: 30.198, lng: -97.904 }, // Circle C Ranch (~4.4 mi from 78748)
  '78747': { lat: 30.134, lng: -97.762 }, // Onion Creek (~4.8 mi from 78748)
  '78652': { lat: 30.141, lng: -97.866 }, // Manchaca (~3.1 mi from 78748)
  '78704': { lat: 30.245, lng: -97.761 }, // South Congress / Zilker (~6.2 mi from 78748)
  '78744': { lat: 30.189, lng: -97.742 }, // Southeast Austin / Bluff Springs (~5.5 mi from 78748)
  '78701': { lat: 30.267, lng: -97.743 }, // Downtown Austin (~9.2 mi from 78748)
  '78702': { lat: 30.262, lng: -97.718 }, // East Austin (~10.4 mi from 78748)
  '78703': { lat: 30.285, lng: -97.768 }, // Tarrytown / Clarksville (~8.4 mi from 78748)
  '78746': { lat: 30.285, lng: -97.808 }, // Westlake Hills (~8.6 mi from 78748)
  '78735': { lat: 30.252, lng: -97.852 }, // Barton Creek / Southwest Pkwy (~5.8 mi from 78748)
  '78723': { lat: 30.305, lng: -97.689 }, // Mueller / Windsor Park (~13.2 mi from 78748)
  '78751': { lat: 30.312, lng: -97.724 }, // Hyde Park (~12.5 mi from 78748)
  '78757': { lat: 30.355, lng: -97.734 }, // Brentwood / Allandale (~14.2 mi from 78748)
  '78610': { lat: 30.083, lng: -97.828 }, // Buda (~6.5 mi from 78748)
};

// Subtle offsets for hyper-local subdivisions within the same zip code
const NEIGHBORHOOD_OFFSETS: Record<string, { latOffset: number; lngOffset: number }> = {
  'Shady Hollow': { latOffset: -0.005, lngOffset: -0.008 },
  'Tanglewood Forest': { latOffset: 0.012, lngOffset: 0.005 },
  'Bauerle Ranch': { latOffset: 0.008, lngOffset: -0.012 },
  'Castlewood Forest': { latOffset: 0.015, lngOffset: -0.002 },
  'South Manchaca': { latOffset: 0.006, lngOffset: 0.008 },
  'Olympic Heights': { latOffset: -0.018, lngOffset: 0.004 },
  'Buckingham Ridge': { latOffset: -0.012, lngOffset: -0.004 },
  'Slaughter Creek': { latOffset: 0.002, lngOffset: 0.018 },
  'Sendera South': { latOffset: 0.018, lngOffset: -0.015 },
  'Texas Oaks': { latOffset: 0.009, lngOffset: 0.014 },
  'Circle C Ranch': { latOffset: 0.005, lngOffset: -0.005 },
  'Circle C West / Hielscher': { latOffset: 0.012, lngOffset: -0.018 },
  'Sendera': { latOffset: -0.008, lngOffset: 0.008 },
  'Maple Run': { latOffset: 0.004, lngOffset: -0.006 },
  'Westgate': { latOffset: 0.008, lngOffset: 0.004 },
  'Sunset Valley area': { latOffset: 0.018, lngOffset: -0.008 },
};

export function getCoordinates(zip: string, neighborhood?: string): GeoCoord {
  const base = AUSTIN_ZIP_COORDS[zip.trim()] || AUSTIN_ZIP_COORDS['78748'];
  if (!neighborhood) return base;

  const offset = NEIGHBORHOOD_OFFSETS[neighborhood];
  if (offset) {
    return {
      lat: base.lat + offset.latOffset,
      lng: base.lng + offset.lngOffset,
    };
  }

  // Slight deterministic jitter based on neighborhood name length so different subdivisions have slight differences
  const hash = neighborhood.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 17) - 8) * 0.001;
  const jitterLng = (((hash * 3) % 17) - 8) * 0.001;

  return {
    lat: base.lat + jitterLat,
    lng: base.lng + jitterLng,
  };
}

/**
 * Calculates distance in miles between two locations using the Haversine formula
 */
export function calculateDistanceMiles(
  fromZip: string,
  toZip: string,
  fromNeighborhood?: string,
  toNeighborhood?: string
): number {
  if (fromNeighborhood && toNeighborhood && fromNeighborhood === toNeighborhood && fromZip === toZip) {
    return 0.3; // Same neighborhood
  }

  const coord1 = getCoordinates(fromZip, fromNeighborhood);
  const coord2 = getCoordinates(toZip, toNeighborhood);

  const R = 3958.8; // Earth radius in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  // Round to 1 decimal place, minimum 0.2
  return Math.max(0.2, Math.round(dist * 10) / 10);
}

export function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${miles} mi (immediate neighbor)`;
  }
  return `${miles} mi away`;
}
