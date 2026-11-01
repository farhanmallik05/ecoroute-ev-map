import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Zap } from 'lucide-react';
import { EVStationFeature } from '../types';
import { POPULAR_DESTINATIONS } from '../utils/geoUtils';

interface SearchBarProps {
  stations: EVStationFeature[];
  onSelectLocation: (coords: [number, number], name: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ stations, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDestinations = Object.entries(POPULAR_DESTINATIONS).filter(([_, stop]) =>
    stop.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStations = stations
    .filter((st) => st.properties.name.toLowerCase().includes(query.toLowerCase()) ||
                    st.properties.city.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const handleSelect = (coords: [number, number], name: string) => {
    onSelectLocation(coords, name);
    setQuery(name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city, station, or address..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-400 text-xs outline-none focus:border-emerald-500 transition-colors shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-1 max-h-64 overflow-y-auto text-xs">
          {filteredDestinations.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block uppercase">Destinations</span>
              {filteredDestinations.map(([key, stop]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(stop.coordinates, stop.name)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{stop.name}</span>
                </button>
              ))}
            </div>
          )}

          {filteredStations.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block uppercase mt-1">Charging Stations</span>
              {filteredStations.map((st) => (
                <button
                  key={st.properties.id}
                  onClick={() => handleSelect(st.geometry.coordinates, st.properties.name)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{st.properties.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{st.properties.power_kw}kW</span>
                </button>
              ))}
            </div>
          )}

          {filteredDestinations.length === 0 && filteredStations.length === 0 && (
            <p className="p-3 text-center text-slate-500 text-xs">No matching locations found.</p>
          )}
        </div>
      )}
    </div>
  );
};

