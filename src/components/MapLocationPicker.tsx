import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Info, Key, CheckCircle } from 'lucide-react';
import { DEFAULT_CAMPUS_CENTER, CAMPUS_LOCATION_PRESETS } from '../utils/campusLocations';

interface MapLocationPickerProps {
  lat?: number;
  lng?: number;
  onSelectLocation: (lat: number, lng: number) => void;
  selectedLocationName?: string;
  className?: string;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  lat,
  lng,
  onSelectLocation,
  selectedLocationName,
  className = ''
}) => {
  const currentLat = lat || DEFAULT_CAMPUS_CENTER.lat;
  const currentLng = lng || DEFAULT_CAMPUS_CENTER.lng;

  const [markerPos, setMarkerPos] = useState({ lat: currentLat, lng: currentLng });

  useEffect(() => {
    if (lat && lng) {
      setMarkerPos({ lat, lng });
    }
  }, [lat, lng]);

  const handleMapClick = (ev: any) => {
    if (ev.detail && ev.detail.latLng) {
      const newLat = Number(ev.detail.latLng.lat.toFixed(6));
      const newLng = Number(ev.detail.latLng.lng.toFixed(6));
      setMarkerPos({ lat: newLat, lng: newLng });
      onSelectLocation(newLat, newLng);
    }
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = CAMPUS_LOCATION_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setMarkerPos({ lat: preset.lat, lng: preset.lng });
      onSelectLocation(preset.lat, preset.lng);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Header & Coordinates Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-blue-50/80 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Click Map to Set Location Coordinates
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedLocationName ? selectedLocationName : 'Campus Coordinates Selected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
          <Navigation className="w-3.5 h-3.5 text-blue-500" />
          <span>{markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Preset Building Quick Jump */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
          Quick Preset:
        </span>
        {CAMPUS_LOCATION_PRESETS.slice(0, 5).map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handlePresetSelect(preset.name)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              markerPos.lat === preset.lat && markerPos.lng === preset.lng
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {preset.building}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-950">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: markerPos.lat, lng: markerPos.lng }}
              center={{ lat: markerPos.lat, lng: markerPos.lng }}
              defaultZoom={16}
              mapId="CAMPUS_LOST_FOUND_MAP"
              onClick={handleMapClick}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              <AdvancedMarker position={markerPos} title="Selected Lost/Found Spot">
                <Pin background="#2563EB" glyphColor="#FFFFFF" borderColor="#1D4ED8" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white overflow-hidden">
            {/* Interactive Campus SVG Map Canvas Fallback when Key isn't configured */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <Key className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-black tracking-tight text-white">
                  Google Maps Key Ready
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  To render full vector map tiles, add your key under <strong>Settings (⚙️) → Secrets → GOOGLE_MAPS_PLATFORM_KEY</strong>.
                </p>
              </div>

              {/* Clickable Interactive Campus Grid Fallback */}
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                  <span>Interactive Campus Pin Selector</span>
                  <span className="text-[10px] text-slate-400">Click building below</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {CAMPUS_LOCATION_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePresetSelect(preset.name)}
                      className={`p-2 rounded-lg text-left transition-all font-medium border flex items-center gap-1.5 ${
                        markerPos.lat === preset.lat && markerPos.lng === preset.lng
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{preset.building}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Latitude and Longitude coordinates will be saved with your report listing.</span>
      </div>
    </div>
  );
};
