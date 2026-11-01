import React from 'react';
import { Zap, Navigation, SlidersHorizontal, FileText, Compass, Car, Bookmark } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { EVStationFeature } from '../types';

interface NavbarProps {
  onToggleFilters: () => void;
  onToggleRoutePlanner: () => void;
  onOpenItinerary: () => void;
  onOpenSavedRoutes?: () => void;
  isRoutingActive: boolean;
  stationCount: number;
  stations: EVStationFeature[];
  onSelectLocation: (coords: [number, number], name: string) => void;
  isIsochroneActive: boolean;
  onToggleIsochrone: () => void;
  onToggleVehicleSelector?: () => void;
  isVehicleSelectorOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleFilters,
  onToggleRoutePlanner,
  onOpenItinerary,
  onOpenSavedRoutes,
  isRoutingActive,
  stations,
  onSelectLocation,
  isIsochroneActive,
  onToggleIsochrone,
  onToggleVehicleSelector,
  isVehicleSelectorOpen,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex justify-center">
      <header className="pointer-events-auto w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl md:rounded-full bg-[#0a0f1d]/85 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3 pl-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm md:text-base tracking-tight text-white font-sans">EcoRoute</h1>
              <span className="px-2.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                AWS Spatial • NREL Clean Grid
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-sans">EV Corridor &amp; Elevation Telemetry</p>
          </div>
        </div>

        {/* Search Bar in Middle */}
        <div className="order-3 md:order-2 w-full md:w-auto flex-1 max-w-md px-2">
          <SearchBar stations={stations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Action Controls */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 md:gap-2 pr-2">
          {/* Vehicle Config */}
          {onToggleVehicleSelector && (
            <button
              onClick={onToggleVehicleSelector}
              title="Configure EV Model & Ambient Temperature"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full transition-all duration-200 active:scale-[0.98] border ${
                isVehicleSelectorOpen
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Vehicle &amp; Temp</span>
            </button>
          )}

          {/* Isochrone Range Toggle */}
          <button
            onClick={onToggleIsochrone}
            title="Toggle Vehicle Range Reach Circle"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full transition-all duration-200 active:scale-[0.98] border ${
              isIsochroneActive
                ? 'bg-teal-500/20 text-teal-200 border-teal-500/60 shadow-lg shadow-teal-500/20'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Range Reach</span>
          </button>

          {/* Itinerary */}
          {isRoutingActive && (
            <button
              onClick={onOpenItinerary}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/15 active:scale-[0.98] transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Itinerary</span>
            </button>
          )}

          {/* Saved Trips */}
          {onOpenSavedRoutes && (
            <button
              onClick={onOpenSavedRoutes}
              title="View Saved Corridors"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 active:scale-[0.98] transition-all"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Saved Trips</span>
            </button>
          )}

          {/* Route Planner CTA Button */}
          <button
            onClick={onToggleRoutePlanner}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 active:scale-[0.98] shadow-lg ${
              isRoutingActive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-emerald-500/30 hover:brightness-110'
                : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/15'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isRoutingActive ? 'Route Active' : 'Plan Trip'}</span>
          </button>

          {/* Filters Toggle */}
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 active:scale-[0.98] transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </header>
    </div>
  );
};
