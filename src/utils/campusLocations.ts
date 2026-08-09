export interface CampusLocationPreset {
  name: string;
  building: string;
  lat: number;
  lng: number;
}

export const DEFAULT_CAMPUS_CENTER = {
  lat: 37.8719,
  lng: -122.2585,
  name: 'Main Campus Center'
};

export const CAMPUS_LOCATION_PRESETS: CampusLocationPreset[] = [
  {
    name: 'Central Library - 2nd Floor Quiet Zone',
    building: 'Central Library',
    lat: 37.8724,
    lng: -122.2590
  },
  {
    name: 'Student Union Center - Food Court',
    building: 'Student Union',
    lat: 37.8692,
    lng: -122.2597
  },
  {
    name: 'Engineering Building - Lab 302',
    building: 'Engineering Building',
    lat: 37.8752,
    lng: -122.2580
  },
  {
    name: 'Science Complex - Lecture Hall B',
    building: 'Science Complex',
    lat: 37.8730,
    lng: -122.2570
  },
  {
    name: 'Campus Rec Center & Gym',
    building: 'Rec Center',
    lat: 37.8680,
    lng: -122.2610
  },
  {
    name: 'North Quad Lawn',
    building: 'North Quad',
    lat: 37.8740,
    lng: -122.2595
  },
  {
    name: 'Arts & Humanities Building',
    building: 'Arts Building',
    lat: 37.8705,
    lng: -122.2565
  },
  {
    name: 'Dining Hall East',
    building: 'East Dining',
    lat: 37.8710,
    lng: -122.2535
  },
  {
    name: 'Bus Transit Hub',
    building: 'Transit Hub',
    lat: 37.8685,
    lng: -122.2580
  },
  {
    name: 'Campus Security Office',
    building: 'Security Office',
    lat: 37.8698,
    lng: -122.2550
  }
];

export function getLocationPresetByName(name: string): CampusLocationPreset | undefined {
  return CAMPUS_LOCATION_PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase());
}
