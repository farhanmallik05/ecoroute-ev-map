import React, { useState, useMemo } from 'react';
import { RouteResult, RouteStop } from '../types';
import { POPULAR_DESTINATIONS } from '../utils/geoUtils';
import { calculateElevationAndBatteryProfile } from '../utils/elevationUtils';
import { VehicleProfile } from '../utils/vehicleProfiles';
import { ElevationChart } from './ElevationChart';
import { Navigation, MapPin, ArrowRight, Clock, Milestone, Leaf, Fuel, CheckCircle, X } from 'lucide-react';

interface RoutePlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculateRoute: (origin: RouteStop, destination: RouteStop) => void;
  activeRoute: RouteResult | null;
  onClearRoute: () => void;
  selectedVehicle?: VehicleProfile;
  temperatureF?: number;
}

export const RoutePlannerDrawer: React.FC<RoutePlannerDrawerProps> = ({
  isOpen,
  onClose,
  onCalculateRoute,
  activeRoute,
  onClearRoute,
  selectedVehicle,
  temperatureF = 70,
}) => {
  const [originKey, setOriginKey] = useState<string>('SF');
  const [destKey, setDestKey] = useState<string>('TAHOE');

  const elevationProfile = useMemo(() => {
    if (!activeRoute) return null;
    return calculateElevationAndBatteryProfile(
      activeRoute.distanceMiles,
      88,
      selectedVehicle ? selectedVehicle.batteryCapacityKWh : 77,
      selectedVehicle,
      temperatureF
    );
  }, [activeRoute, selectedVehicle, temperatureF]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = POPULAR_DESTINATIONS[originKey];
    const destination = POPULAR_DESTINATIONS[destKey];
    if (origin && destination) {
      onCalculateRoute(origin, destination);
    }
  };

  return (
    <div className="fixed top-24 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] p-1.5 rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-slate-100 animate-in slide-in-from-left-4 duration-300 max-h-[85vh] overflow-y-auto">
      <div className="rounded-[calc(2rem-0.375rem)] bg-[#0e131f]/95 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">EcoRoute Trip Planner</h2>
              <p className="text-[10px] text-slate-400 font-mono">Elevation &amp; Regen Modeling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Route Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="flex items-center gap-1.5 text-slate-300 font-medium mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Origin Waypoint
            </label>
            <select
              value={originKey}
              onChange={(e) => setOriginKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 outline-none focus:border-emerald-500/70 font-medium transition-colors"
            >
              {Object.entries(POPULAR_DESTINATIONS).map(([key, stop]) => (
                <option key={key} value={key} disabled={key === destKey} className="bg-[#0e131f] text-slate-100">
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-slate-300 font-medium mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Destination Waypoint
            </label>
            <select
              value={destKey}
              onChange={(e) => setDestKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 outline-none focus:border-emerald-500/70 font-medium transition-colors"
            >
              {Object.entries(POPULAR_DESTINATIONS).map(([key, stop]) => (
                <option key={key} value={key} disabled={key === originKey} className="bg-[#0e131f] text-slate-100">
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="group w-full py-3 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <span>Simulate Elevation Corridor</span>
            <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </form>

        {/* Active Route Summary */}
        {activeRoute && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Corridor Telemetry &amp; Physics
              </span>
              <button
                onClick={onClearRoute}
                className="text-[11px] text-rose-400 hover:underline font-mono"
              >
                Clear Route
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
                  <Milestone className="w-3.5 h-3.5 text-emerald-400" />
                  Distance
                </div>
                <p className="text-base font-extrabold text-white font-mono tabular-nums">{activeRoute.distanceMiles} mi</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Travel Time
                </div>
                <p className="text-base font-extrabold text-white font-mono tabular-nums">
                  {Math.floor(activeRoute.durationMinutes / 60)}h {activeRoute.durationMinutes % 60}m
                </p>
              </div>
            </div>

            {/* Environmental Badges */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/25 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  CO₂ Emissions Avoided
                </span>
                <strong className="text-white font-mono tabular-nums">{activeRoute.carbonSavedLbs} lbs</strong>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-teal-300">
                  <Fuel className="w-4 h-4 text-teal-400" />
                  Gasoline Displaced
                </span>
                <strong className="text-white font-mono tabular-nums">{activeRoute.gasGallonsSaved} gal</strong>
              </div>
            </div>

            {/* Elevation & Battery Model */}
            {elevationProfile && (
              <ElevationChart profile={elevationProfile} />
            )}

            {/* Corridor Charging Stations */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Charging Stops Along Corridor ({activeRoute.stationsAlongRoute.length}):
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeRoute.stationsAlongRoute.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No charging stations directly on this path.</p>
                ) : (
                  activeRoute.stationsAlongRoute.map((st) => (
                    <div
                      key={st.properties.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-white truncate max-w-[180px]">{st.properties.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{st.properties.operator} • {st.properties.power_kw} kW</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                        {st.properties.ports_available} free
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
