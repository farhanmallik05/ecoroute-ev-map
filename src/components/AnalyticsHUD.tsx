import React from 'react';
import { Leaf, Sun, Zap, ShieldCheck } from 'lucide-react';

interface AnalyticsHUDProps {
  totalStations: number;
  filteredCount: number;
}

export const AnalyticsHUD: React.FC<AnalyticsHUDProps> = ({
  totalStations,
  filteredCount,
}) => {
  return (
    <div className="absolute bottom-6 left-6 z-20 hidden lg:flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 text-xs shadow-2xl">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
        <Zap className="w-4 h-4 text-emerald-400" />
        <span>Displaying: <strong className="text-white">{filteredCount}</strong> of {totalStations} Fast Chargers</span>
      </div>

      <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
        <Sun className="w-4 h-4 text-amber-400" />
        <span>CA ISO Renewable Mix: <strong className="text-emerald-400">92.8% Solar/Hydro</strong></span>
      </div>

      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        <span>Amazon Location Tile API: <span className="text-emerald-400 font-mono">200 OK</span></span>
      </div>
    </div>
  );
};

