import React from 'react';
import { FilterState } from '../types';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="fixed top-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-5 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl text-slate-100 animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Filter Stations</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 my-4 text-xs">
        {/* Minimum Power */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-300 font-medium">Minimum Power Speed</span>
            <span className="font-bold text-emerald-400">{filters.minPowerKw} kW+</span>
          </div>
          <input
            type="range"
            min="50"
            max="350"
            step="50"
            value={filters.minPowerKw}
            onChange={(e) => onFilterChange({ ...filters, minPowerKw: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>50 kW (L2/Fast)</span>
            <span>150 kW</span>
            <span>350 kW (Ultra)</span>
          </div>
        </div>

        {/* Network Operator */}
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Charging Network</label>
          <select
            value={filters.operator}
            onChange={(e) => onFilterChange({ ...filters, operator: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Networks</option>
            <option value="Tesla Supercharger">Tesla Supercharger</option>
            <option value="Electrify America">Electrify America</option>
            <option value="ChargePoint">ChargePoint</option>
            <option value="EVgo">EVgo</option>
            <option value="Rivian Adventure Network">Rivian Adventure Network</option>
          </select>
        </div>

        {/* Connector Type */}
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Connector Plug</label>
          <select
            value={filters.connector}
            onChange={(e) => onFilterChange({ ...filters, connector: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="ALL">Any Connector</option>
            <option value="NACS">NACS (Tesla / Universal 2025+)</option>
            <option value="CCS">CCS (Combo 1)</option>
            <option value="J1772">J1772 (Level 2 AC)</option>
          </select>
        </div>

        {/* Minimum Renewable Energy Percentage */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-300 font-medium">Clean Energy Percentage</span>
            <span className="font-bold text-teal-400">{filters.minRenewablePct}%+ Solar/Wind</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={filters.minRenewablePct}
            onChange={(e) => onFilterChange({ ...filters, minRenewablePct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Toggle Available Only */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => onFilterChange({ ...filters, onlyAvailable: e.target.checked })}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 accent-emerald-500"
          />
          <span className="text-slate-300 select-none">Show Available Ports Only</span>
        </label>
      </div>
    </aside>
  );
};

