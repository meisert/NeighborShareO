import { NeighborhoodProposal } from '../types';

export interface ZipNeighborhoodInfo {
  zip: string;
  areaName: string;
  neighborhoods: string[];
}

export const AUSTIN_ZIP_DATA: Record<string, ZipNeighborhoodInfo> = {
  '78748': {
    zip: '78748',
    areaName: 'South Austin (Slaughter / Manchaca)',
    neighborhoods: [
      'Shady Hollow',
      'Tanglewood Forest',
      'Bauerle Ranch',
      'Castlewood Forest',
      'South Manchaca',
      'Olympic Heights',
      'Buckingham Ridge',
      'Slaughter Creek',
      'Texas Oaks',
      'Ravenscroft',
      'Dittmar',
      'Menchaca Woods',
      'Gabardine',
      'Grand Oaks',
    ],
  },
  '78745': {
    zip: '78745',
    areaName: 'South Austin (Westgate / St. Elmo)',
    neighborhoods: [
      'Westgate',
      'Sunset Valley area',
      'Garrison Park',
      'Cherry Creek',
      'Western Trails',
      'Southwood',
      'St. Elmo District',
      'Greenwood Forest',
    ],
  },
  '78704': {
    zip: '78704',
    areaName: 'South Central Austin (SoCo & Zilker)',
    neighborhoods: [
      'South Congress (SoCo)',
      'Zilker',
      'Bouldin Creek',
      'Barton Hills',
      'Travis Heights',
      'Galindo',
      'Dawson',
    ],
  },
  '78739': {
    zip: '78739',
    areaName: 'Southwest Austin (Circle C Ranch)',
    neighborhoods: [
      'Circle C Ranch',
      'Circle C West / Hielscher',
      'Meridian',
      'Vintage Place',
      'Escarpment Village area',
      'Avana',
      'Wildflower Park',
    ],
  },
  '78749': {
    zip: '78749',
    areaName: 'Southwest Austin (Oak Hill / Sendera)',
    neighborhoods: [
      'Sendera',
      'Maple Run',
      'Westcreek',
      'Legend Oaks',
      'Lantana',
      'Covered Bridge',
    ],
  },
  '78747': {
    zip: '78747',
    areaName: 'Southeast Austin (Onion Creek)',
    neighborhoods: [
      'Onion Creek',
      'Crossing at Onion Creek',
      'Colorado Crossing',
      'McKinney Falls area',
      'Bradshaw Crossing',
    ],
  },
  '78701': {
    zip: '78701',
    areaName: 'Downtown Austin',
    neighborhoods: [
      'Downtown',
      'Warehouse District',
      'Rainey Street District',
      'Market District',
      'Seaholm District',
    ],
  },
  '78702': {
    zip: '78702',
    areaName: 'East Austin',
    neighborhoods: [
      'East Cesar Chavez',
      'Holly',
      'Govalle',
      'Rosewood',
      'French Place',
      'Chestnut',
    ],
  },
  '78703': {
    zip: '78703',
    areaName: 'Central West Austin',
    neighborhoods: [
      'Clarksville',
      'Tarrytown',
      'Old West Austin',
      'Pemberton Heights',
      'Deep Eddy',
    ],
  },
  '78723': {
    zip: '78723',
    areaName: 'Mueller & Windsor Park',
    neighborhoods: [
      'Mueller',
      'Windsor Park',
      'University Hills',
      'Pecan Springs',
    ],
  },
  '78746': {
    zip: '78746',
    areaName: 'Westlake & Rollingwood',
    neighborhoods: [
      'Westlake Hills',
      'Rollingwood',
      'Lost Creek',
      'Davenport Ranch',
    ],
  },
  '78757': {
    zip: '78757',
    areaName: 'North Central Austin',
    neighborhoods: [
      'Allandale',
      'Crestview',
      'Brentwood',
      'Wooten',
    ],
  },
  '78751': {
    zip: '78751',
    areaName: 'Central Austin (Hyde Park)',
    neighborhoods: [
      'Hyde Park',
      'North Loop',
      'Hancock',
    ],
  },
  '78652': {
    zip: '78652',
    areaName: 'Manchaca (South 78748)',
    neighborhoods: [
      'Manchaca Village',
      'Twin Creeks South',
      'Marbridge area',
    ],
  },
  '78610': {
    zip: '78610',
    areaName: 'Buda (South of Austin)',
    neighborhoods: [
      'Bradfield Village',
      'Sunfield',
      'Garlic Creek',
      'Downtown Buda',
    ],
  },
  // Nationwide US Major Metros & Neighborhoods
  '80205': {
    zip: '80205',
    areaName: 'Denver, CO (RiNo / Five Points)',
    neighborhoods: ['RiNo Art District', 'Five Points', 'Whittier', 'Cole', 'Curtis Park'],
  },
  '80211': {
    zip: '80211',
    areaName: 'Denver, CO (Highlands / Sunnyside)',
    neighborhoods: ['Highland', 'West Highland', 'Sunnyside', 'LoHi', 'Berkeley'],
  },
  '98103': {
    zip: '98103',
    areaName: 'Seattle, WA (Green Lake / Fremont)',
    neighborhoods: ['Fremont', 'Wallingford', 'Green Lake', 'Phinney Ridge', 'Tangletown'],
  },
  '98122': {
    zip: '98122',
    areaName: 'Seattle, WA (Capitol Hill / Central District)',
    neighborhoods: ['Capitol Hill', 'Central District', 'Madrona', 'First Hill', 'Leschi'],
  },
  '60614': {
    zip: '60614',
    areaName: 'Chicago, IL (Lincoln Park / DePaul)',
    neighborhoods: ['Lincoln Park', 'DePaul', 'Old Town Triangle', 'Sheffield Neighbors', 'Ranch Triangle'],
  },
  '60622': {
    zip: '60622',
    areaName: 'Chicago, IL (Wicker Park / Ukrainian Village)',
    neighborhoods: ['Wicker Park', 'Ukrainian Village', 'East Village', 'Noble Square'],
  },
  '92104': {
    zip: '92104',
    areaName: 'San Diego, CA (North Park / South Park)',
    neighborhoods: ['North Park', 'South Park', 'Burlingame', 'University Heights', 'Altadena'],
  },
  '90026': {
    zip: '90026',
    areaName: 'Los Angeles, CA (Echo Park / Silver Lake)',
    neighborhoods: ['Echo Park', 'Silver Lake', 'Angelino Heights', 'Elysian Heights'],
  },
  '11215': {
    zip: '11215',
    areaName: 'Brooklyn, NY (Park Slope / Gowanus)',
    neighborhoods: ['Park Slope', 'South Slope', 'Gowanus', 'Prospect Heights'],
  },
  '30307': {
    zip: '30307',
    areaName: 'Atlanta, GA (Inman Park / Candler Park)',
    neighborhoods: ['Inman Park', 'Candler Park', 'Little Five Points', 'Edgewood', 'Druid Hills'],
  },
  '37206': {
    zip: '37206',
    areaName: 'Nashville, TN (East Nashville)',
    neighborhoods: ['East Nashville', 'Lockeland Springs', 'Five Points', 'East End', 'Cleveland Park'],
  },
  '75204': {
    zip: '75204',
    areaName: 'Dallas, TX (Uptown / Knox-Henderson)',
    neighborhoods: ['Uptown', 'Knox-Henderson', 'State Thomas', 'Cityplace', 'West Village'],
  },
};

export const US_ZIP_DATA = AUSTIN_ZIP_DATA;

export const INITIAL_NEIGHBORHOOD_PROPOSALS: NeighborhoodProposal[] = [
  {
    id: 'prop-demo-1',
    zipCode: '78748',
    neighborhoodName: 'Sendera South',
    areaName: 'South Austin (Slaughter / Manchaca)',
    requesterName: 'Taylor Morgan',
    requesterEmail: 'taylor.m@austin.rr.com',
    notes: 'Subdivision off Davis Ln & West Gate Blvd in 78748 with ~240 homes. We have an active HOA and want to borrow lawn aerators.',
    status: 'pending',
    submittedAt: '2026-10-15T16:20:00Z',
  },
  {
    id: 'prop-demo-2',
    zipCode: '78745',
    neighborhoodName: 'Auburn Mound',
    areaName: 'South Austin (Westgate / St. Elmo)',
    requesterName: 'Carlos Vega',
    requesterEmail: 'carlos.vega@gmail.com',
    notes: 'Quiet residential cul-de-sac pocket between Manchaca and South 1st St.',
    status: 'pending',
    submittedAt: '2026-10-15T18:40:00Z',
  },
  {
    id: 'prop-demo-3',
    zipCode: '78748',
    neighborhoodName: 'Texas Oaks East',
    areaName: 'South Austin (Slaughter / Manchaca)',
    requesterName: 'Elena Rostova',
    requesterEmail: 'elena.rostova@gmail.com',
    notes: 'Approved community request for east section near Mary Moore Searight park.',
    status: 'approved',
    submittedAt: '2026-10-14T10:00:00Z',
    reviewedAt: '2026-10-14T14:30:00Z',
    reviewedBy: 'Admin (System)',
  },
];

export const getNeighborhoodsForZip = (zip: string): { areaName: string; neighborhoods: string[] } | null => {
  const cleanZip = zip.trim();
  if (AUSTIN_ZIP_DATA[cleanZip]) {
    return AUSTIN_ZIP_DATA[cleanZip];
  }
  return null;
};
