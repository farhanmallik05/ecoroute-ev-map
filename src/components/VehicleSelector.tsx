import React from 'react';
import { VehicleProfile, POPULAR_EV_PROFILES, calculateEffectiveRange } from '../utils/vehicleProfiles';

interface VehicleSelectorProps {
  selectedVehicle: VehicleProfile;
  onSelectVehicle: (vehicle: VehicleProfile) => void;
  batteryPct: number;
  onBatteryChange: (pct: number) => void;
  temperatureF: number;
  onTemperatureChange: (temp: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onSelectVehicle,
  batteryPct,
  onBatteryChange,
  temperatureF,
  onTemperatureChange,
}) => {
  const effectiveRange = calculateEffectiveRange(selectedVehicle, batteryPct, temperatureF);

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-xl text-white text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{selectedVehicle.imageIcon}</span>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">
              {selectedVehicle.brand} {selectedVehicle.name}
            </h4>
            <p className="text-slate-400 text-[11px]">
              {selectedVehicle.batteryCapacityKWh} kWh Pack • {selectedVehicle.maxChargeRateKW} kW Peak
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 font-bold text-sm">{effectiveRange} mi</span>
          <p className="text-[10px] text-slate-400">Est. Range</p>
        </div>
      </div>

      {/* Model Selection Dropdown */}
      <div className="mb-3">
        <label className="text-slate-400 block mb-1 font-medium">Select EV Model</label>
        <select
          value={selectedVehicle.id}
          onChange={(e) => {
            const found = POPULAR_EV_PROFILES.find((v) => v.id === e.target.value);
            if (found) onSelectVehicle(found);
          }}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {POPULAR_EV_PROFILES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.imageIcon} {v.brand} {v.name} ({v.baseRangeMiles} mi EPA, {v.batteryCapacityKWh} kWh)
            </option>
          ))}
        </select>
      </div>

      {/* Battery SoC Slider */}
      <div className="mb-3">
        <div className="flex justify-between text-slate-400 mb-1">
          <span>Battery Charge (SoC):</span>
          <span className="font-semibold text-emerald-400">{batteryPct}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={batteryPct}
          onChange={(e) => onBatteryChange(Number(e.target.value))}
          className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Ambient Temperature Slider */}
      <div>
        <div className="flex justify-between text-slate-400 mb-1">
          <span>Ambient Temp &amp; HVAC:</span>
          <span
            className={`font-semibold ${
              temperatureF < 32
                ? 'text-cyan-400'
                : temperatureF > 85
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {temperatureF}°F {temperatureF < 32 ? '❄️ Cold' : temperatureF > 85 ? '☀️ Hot' : '🌱 Ideal'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="110"
          value={temperatureF}
          onChange={(e) => onTemperatureChange(Number(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0°F (Blizzard)</span>
          <span>70°F (Optimum)</span>
          <span>110°F (Desert)</span>
        </div>
      </div>
    </div>
  );
};

