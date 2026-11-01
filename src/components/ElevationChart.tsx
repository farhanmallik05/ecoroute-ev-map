import React from 'react';
import { Mountain, BatteryCharging, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { ElevationProfileResult } from '../utils/elevationUtils';

interface ElevationChartProps {
  profile: ElevationProfileResult | null;
  onClose?: () => void;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ profile, onClose }) => {
  if (!profile || profile.points.length === 0) return null;

  const maxElev = Math.max(...profile.points.map((p) => p.elevationFeet), 1000);
  const minElev = Math.min(...profile.points.map((p) => p.elevationFeet), 0);
  const elevRange = maxElev - minElev || 1;

  // Generate SVG path coordinates
  const width = 360;
  const height = 90;

  const pointsPath = profile.points.map((p, i) => {
    const x = (i / (profile.points.length - 1)) * width;
    const y = height - ((p.elevationFeet - minElev) / elevRange) * (height - 15) - 5;
    return `${x},${y}`;
  });

  const svgPath = `M ${pointsPath.join(' L ')}`;
  const areaPath = `M 0,${height} L ${pointsPath.join(' L ')} L ${width},${height} Z`;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Mountain className="w-4 h-4 text-emerald-400" />
          Corridor Elevation & Battery Model
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
          {profile.finalBatteryPct}% Battery at Dest.
        </span>
      </div>

      {/* SVG Elevation Chart */}
      <div className="relative w-full h-24 bg-slate-950/60 rounded-xl overflow-hidden p-2 border border-slate-800/60">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#elevGradient)" />
          <path d={svgPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        <div className="absolute top-1 left-2 text-[9px] text-slate-400 font-mono">
          Max: {maxElev} ft
        </div>
        <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono">
          Min: {minElev} ft
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
        <div className="p-1.5 rounded-lg bg-slate-800/60">
          <span className="text-slate-400 block">Total Ascent</span>
          <strong className="text-white flex items-center justify-center gap-0.5">
            <ArrowUp className="w-3 h-3 text-emerald-400" />
            +{profile.totalAscentFeet} ft
          </strong>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-800/60">
          <span className="text-slate-400 block">Total Descent</span>
          <strong className="text-white flex items-center justify-center gap-0.5">
            <ArrowDown className="w-3 h-3 text-teal-400" />
            -{profile.totalDescentFeet} ft
          </strong>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-800/60">
          <span className="text-slate-400 block">Net Energy</span>
          <strong className="text-white font-mono">{profile.netEnergyConsumedKwh} kWh</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-800/60">
          <span className="text-slate-400 block">Regen Gained</span>
          <strong className="text-teal-300 font-mono">+{profile.regenEnergyGainedKwh} kWh</strong>
        </div>
      </div>
    </div>
  );
};

