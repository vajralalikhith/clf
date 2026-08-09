import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Building, Compass } from 'lucide-react';
import { DEFAULT_CAMPUS_CENTER, getLocationPresetByName } from '../utils/campusLocations';

interface ItemLocationMapProps {
  locationName: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const ItemLocationMap: React.FC<ItemLocationMapProps> = ({
  locationName,
  building,
  latitude,
  longitude,
  className = ''
}) => {
  // Determine coordinates: explicit lat/lng or matched preset or campus default
  let lat = latitude;
  let lng = longitude;

  if (!lat || !lng) {
    const preset = getLocationPresetByName(locationName);
    if (preset) {
      lat = preset.lat;
      lng = preset.lng;
    } else {
      lat = DEFAULT_CAMPUS_CENTER.lat;
      lng = DEFAULT_CAMPUS_CENTER.lng;
    }
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
    locationName
  )}`;

  return (
    <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Item Location Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locationName} {building ? `(${building})` : ''}
          </p>
        </div>

        {/* Directions Action Button */}
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Open Directions</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-950">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat, lng }}
              center={{ lat, lng }}
              defaultZoom={16}
              mapId="ITEM_LOCATION_VIEW_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={false}
            >
              <AdvancedMarker position={{ lat, lng }} title={locationName}>
                <Pin background="#DC2626" glyphColor="#FFFFFF" borderColor="#991B1B" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="relative w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 space-y-3 max-w-xs">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">
                  {locationName}
                </h4>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Lat: {lat.toFixed(4)} | Lng: {lng.toFixed(4)}
                </p>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>Navigate in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Lat/Lng Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-blue-500" />
          <span>{building || 'Campus Zone'}</span>
        </div>
        <div>
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      </div>
    </div>
  );
};
