import React, { useState } from 'react';
import { RouteResult } from '../types';
import { X, Download, Copy, Check, Navigation, Clock, Fuel, Zap, MapPin } from 'lucide-react';

interface ItineraryModalProps {
  route: RouteResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({ route, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !route) return null;

  const handleCopy = () => {
    const text = `EcoRoute Trip Itinerary:
Origin: ${route.origin.name}
Destination: ${route.destination.name}
Total Distance: ${route.distanceMiles} miles
Estimated Travel Time: ${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m
CO2 Avoided: ${route.carbonSavedLbs} lbs
Gasoline Saved: ${route.gasGallonsSaved} gallons

Charging Pitstops (${route.stationsAlongRoute.length}):
${route.stationsAlongRoute.map((st, i) => `${i + 1}. ${st.properties.name} (${st.properties.power_kw}kW, ${st.properties.operator}) - ${st.properties.ports_available} free ports`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(route, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecoroute-itinerary-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Full Trip Itinerary & Driver Manifest</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Trip Summary */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Miles</span>
              <strong className="text-sm font-bold text-white">{route.distanceMiles} mi</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Drive Time</span>
              <strong className="text-sm font-bold text-white">
                {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CO₂ Avoided</span>
              <strong className="text-sm font-bold text-emerald-400">{route.carbonSavedLbs} lbs</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Gas Saved</span>
              <strong className="text-sm font-bold text-teal-300">{route.gasGallonsSaved} gal</strong>
            </div>
          </div>

          {/* Stepped Route Manifest */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Route Waypoint Sequence
            </h3>

            {/* Start */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">A</span>
              <div>
                <p className="font-bold text-white">{route.origin.name}</p>
                <p className="text-[11px] text-slate-400">Departure with 90% State of Charge (SoC)</p>
              </div>
            </div>

            {/* Intermediate Chargers */}
            {route.stationsAlongRoute.map((st, i) => (
              <div key={st.properties.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/70 border border-emerald-500/30">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{st.properties.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      {st.properties.power_kw} kW Ultra-Fast
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {st.properties.address}, {st.properties.city} • {st.properties.ports_available} free stalls
                  </p>
                  <p className="text-[10px] text-teal-300 mt-1">
                    ⚡ Recommended Pitstop Dwell: 18–22 minutes • {st.properties.renewable_pct}% Clean Grid
                  </p>
                </div>
              </div>
            ))}

            {/* Destination */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0">B</span>
              <div>
                <p className="font-bold text-white">{route.destination.name}</p>
                <p className="text-[11px] text-slate-400">Arrival at destination with safe reserve margin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Itinerary'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Manifest (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

