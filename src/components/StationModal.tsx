import React, { useMemo } from 'react';
import { EVStationFeature } from '../types';
import { X, Zap, Gauge, DollarSign, MapPin, Sun, CheckCircle2, Navigation, Clock, Activity, ArrowRight } from 'lucide-react';
import { simulateStationOccupancy } from '../utils/occupancySimulator';

interface StationModalProps {
  station: EVStationFeature | null;
  onClose: () => void;
  onSetAsDestination?: (station: EVStationFeature) => void;
}

export const StationModal: React.FC<StationModalProps> = ({
  station,
  onClose,
  onSetAsDestination,
}) => {
  if (!station) return null;
  const p = station.properties;

  const occupancy = useMemo(() => simulateStationOccupancy(station), [station]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06080d]/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Double Bezel Outer Shell */}
      <div className="relative w-full max-w-lg p-2 rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Double Bezel Inner Core */}
        <div className="rounded-[calc(2rem-0.5rem)] bg-[#0e131f]/95 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Station Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                  {p.operator}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {p.level === 'DC_FAST' ? 'DC Ultra-Fast' : 'Level 2 AC'}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-white tracking-tight">{p.name}</h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-sans">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {p.address}, {p.city}, {p.state}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                <span>Peak Power</span>
              </div>
              <p className="text-xl font-extrabold text-white font-mono tabular-nums">
                {p.power_kw} <span className="text-xs font-normal text-slate-400">kW</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                <span>Available</span>
              </div>
              <p className="text-xl font-extrabold text-white font-mono tabular-nums">
                {p.ports_available} <span className="text-xs font-normal text-slate-400">/ {p.ports_total}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
                <DollarSign className="w-3 h-3 text-amber-400" />
                <span>Tariff</span>
              </div>
              <p className="text-xs font-bold text-white mt-1 font-mono truncate">{p.pricing}</p>
            </div>
          </div>

          {/* Live Stall Telemetry & Queue Wait */}
          <div className="p-4 rounded-2xl bg-[#06080d]/80 border border-white/10 mb-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Live Stall Telemetry &amp; Wait Time</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  occupancy.statusBadge === 'AVAILABLE_NOW'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {occupancy.statusBadge === 'AVAILABLE_NOW'
                  ? '⚡ Stalls Ready: 0m Wait'
                  : `⏳ Est. Queue: ~${occupancy.estimatedQueueMinutes}m`}
              </span>
            </div>

            {/* Stalls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {occupancy.stalls.map((s) => (
                <div
                  key={s.stallNumber}
                  className={`p-2.5 rounded-xl border text-[11px] transition-all ${
                    s.status === 'AVAILABLE'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 shadow-sm shadow-emerald-500/5'
                      : 'bg-white/[0.02] border-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Stall #{s.stallNumber}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        s.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {s.status === 'AVAILABLE' ? 'OPEN' : 'BUSY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{s.plugType}</p>
                  {s.status === 'CHARGING' && s.remainingMinutes && (
                    <p className="text-[9px] text-amber-300 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" /> ~{s.remainingMinutes}m ({s.socPct}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Renewable Clean Grid Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <Sun className="w-4 h-4 text-amber-400" />
                Grid Clean Energy Ratio
              </span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">{p.renewable_pct}% Renewable</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${p.renewable_pct}%` }}
              />
            </div>
          </div>

          {/* Connectors & Amenities */}
          <div className="space-y-3 text-xs mb-6">
            <div>
              <span className="text-slate-400 block mb-1.5 font-medium">Connectors Verified:</span>
              <div className="flex flex-wrap gap-1.5">
                {p.connectors.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-200 border border-white/10 font-mono text-[11px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1.5 font-medium">On-Site Amenities:</span>
              <div className="flex flex-wrap gap-1.5">
                {p.amenities.map((a) => (
                  <span key={a} className="px-2.5 py-0.5 rounded-md bg-white/[0.03] text-slate-300 border border-white/5 text-[11px]">
                    • {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3">
            {onSetAsDestination && (
              <button
                onClick={() => {
                  onSetAsDestination(station);
                  onClose();
                }}
                className="group flex-1 flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Hub</span>
                <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 text-xs font-semibold rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 active:scale-[0.98] transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
