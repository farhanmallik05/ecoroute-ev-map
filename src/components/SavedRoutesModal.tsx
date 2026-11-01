import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight, X, PlusCircle, Check, Navigation, Leaf } from 'lucide-react';
import { RouteResult } from '../types';
import { VehicleProfile } from '../utils/vehicleProfiles';
import { getSavedRoutes, saveRouteToStorage, deleteSavedRoute, SavedRouteItem } from '../utils/storageUtils';

interface SavedRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: RouteResult | null;
  selectedVehicle: VehicleProfile;
  temperatureF: number;
  onRestoreRoute: (originName: string, destinationName: string) => void;
}

export const SavedRoutesModal: React.FC<SavedRoutesModalProps> = ({
  isOpen,
  onClose,
  activeRoute,
  selectedVehicle,
  temperatureF,
  onRestoreRoute,
}) => {
  const [routes, setRoutes] = useState<SavedRouteItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoutes(getSavedRoutes());
      setSavedSuccess(false);
      setCustomName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoute) return;
    const newItem = saveRouteToStorage(activeRoute, selectedVehicle, temperatureF, customName || undefined);
    setRoutes((prev) => [newItem, ...prev]);
    setSavedSuccess(true);
    setCustomName('');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSavedRoute(id);
    setRoutes(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl p-6 text-xs text-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Saved Trip Corridors</h3>
              <p className="text-[11px] text-slate-400">Access bookmarked EV itineraries with custom vehicle profiles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Route Form */}
        {activeRoute && (
          <form onSubmit={handleSaveCurrent} className="py-3 border-b border-slate-800 space-y-2">
            <label className="text-slate-400 font-bold block uppercase text-[10px]">
              Bookmark Active Route:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Name (default: ${activeRoute.origin.name.split('(')[0]} -> ${activeRoute.destination.name.split('(')[0]})`}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Route'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Saved Routes List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {routes.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Navigation className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-1" />
              <p>No saved trips yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Plan a route and bookmark it to access it anytime offline.</p>
            </div>
          ) : (
            routes.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onRestoreRoute(item.originName, item.destinationName);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({item.createdAt})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{item.distanceMiles} mi</span>
                    <span>•</span>
                    <span>{Math.floor(item.durationMinutes / 60)}h {item.durationMinutes % 60}m</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Leaf className="w-3 h-3" /> {item.carbonSavedLbs} lbs CO₂
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Profile: {item.vehicleName} @ {item.temperatureF}°F
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                    title="Delete saved route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>{routes.length} / 20 Corridors Stored</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

