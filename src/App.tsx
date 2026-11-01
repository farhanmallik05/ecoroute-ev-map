import React, { useState, useEffect, useMemo } from 'react';
import { EVStationFeature, EVStationCollection, RouteResult, FilterState, RouteStop } from './types';
import { generateRouteGeometry } from './utils/geoUtils';
import { POPULAR_EV_PROFILES, VehicleProfile } from './utils/vehicleProfiles';
import { MapView } from './components/MapView';
import { Navbar } from './components/Navbar';
import { StationModal } from './components/StationModal';
import { FilterSidebar } from './components/FilterSidebar';
import { RoutePlannerDrawer } from './components/RoutePlannerDrawer';
import { AnalyticsHUD } from './components/AnalyticsHUD';
import { ItineraryModal } from './components/ItineraryModal';
import { VehicleSelector } from './components/VehicleSelector';
import { SavedRoutesModal } from './components/SavedRoutesModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_STATIONS } from './data/stationsData';

const initialFilters: FilterState = {
  minPowerKw: 50,
  operator: 'ALL',
  connector: 'ALL',
  onlyAvailable: false,
  minRenewablePct: 50,
};

export const AppContent: React.FC = () => {
  const [allStations, setAllStations] = useState<EVStationFeature[]>(INITIAL_STATIONS.features);
  const [selectedStation, setSelectedStation] = useState<EVStationFeature | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState<boolean>(false);
  const [isSavedRoutesOpen, setIsSavedRoutesOpen] = useState<boolean>(false);
  const [isIsochroneActive, setIsIsochroneActive] = useState<boolean>(false);
  const [isVehicleSelectorOpen, setIsVehicleSelectorOpen] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile>(POPULAR_EV_PROFILES[0]);
  const [batteryPct, setBatteryPct] = useState<number>(85);
  const [temperatureF, setTemperatureF] = useState<number>(68);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch GeoJSON station data (with instant fallback to bundled stations)
  useEffect(() => {
    fetch('/data/ev_stations.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data: EVStationCollection) => {
        if (data && data.features && data.features.length > 0) {
          setAllStations(data.features);
        }
      })
      .catch((err) => {
        console.warn('Using bundled EV stations dataset:', err);
      });
  }, []);

  // Filtered station collection
  const filteredStations = useMemo(() => {
    return allStations.filter((st) => {
      const p = st.properties;
      if (p.power_kw < filters.minPowerKw) return false;
      if (filters.operator !== 'ALL' && p.operator !== filters.operator) return false;
      if (filters.connector !== 'ALL' && !p.connectors.includes(filters.connector)) return false;
      if (filters.onlyAvailable && p.ports_available <= 0) return false;
      if (p.renewable_pct < filters.minRenewablePct) return false;
      return true;
    });
  }, [allStations, filters]);

  const geoJsonCollection: EVStationCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredStations,
  }), [filteredStations]);

  // Route calculation handler
  const handleCalculateRoute = (origin: RouteStop, destination: RouteStop) => {
    const route = generateRouteGeometry(origin, destination, allStations);
    setActiveRoute(route);
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  const handleSetStationAsDestination = (station: EVStationFeature) => {
    const origin: RouteStop = { name: 'Current Location (San Francisco)', coordinates: [-122.4194, 37.7749] };
    const destination: RouteStop = { name: station.properties.name, coordinates: station.geometry.coordinates };
    handleCalculateRoute(origin, destination);
    setIsRoutePlannerOpen(true);
  };

  const handleSelectLocation = (coords: [number, number], name: string) => {
    setFlyToCoords(coords);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Navbar with Search & Quick Toggles */}
      <Navbar
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen((prev) => !prev)}
        onOpenItinerary={() => setIsItineraryOpen(true)}
        onOpenSavedRoutes={() => setIsSavedRoutesOpen(true)}
        isRoutingActive={!!activeRoute}
        stationCount={filteredStations.length}
        stations={allStations}
        onSelectLocation={handleSelectLocation}
        isIsochroneActive={isIsochroneActive}
        onToggleIsochrone={() => setIsIsochroneActive((prev) => !prev)}
        onToggleVehicleSelector={() => setIsVehicleSelectorOpen((prev) => !prev)}
        isVehicleSelectorOpen={isVehicleSelectorOpen}
      />

      {/* Main Map Canvas */}
      <main className="w-full h-full">
        <MapView
          stations={geoJsonCollection}
          onSelectStation={(station) => setSelectedStation(station)}
          activeRoute={activeRoute}
          flyToCoords={flyToCoords}
          isIsochroneActive={isIsochroneActive}
          selectedVehicle={selectedVehicle}
          batteryPct={batteryPct}
          temperatureF={temperatureF}
        />
      </main>

      {/* Vehicle & Weather Temp Selector Drawer */}
      {isVehicleSelectorOpen && (
        <div className="absolute top-20 right-4 z-40 w-80 animate-in slide-in-from-top-2 duration-200">
          <VehicleSelector
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            batteryPct={batteryPct}
            onBatteryChange={setBatteryPct}
            temperatureF={temperatureF}
            onTemperatureChange={setTemperatureF}
          />
        </div>
      )}

      {/* Drawers & HUDs */}
      <FilterSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      <RoutePlannerDrawer
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        onCalculateRoute={handleCalculateRoute}
        activeRoute={activeRoute}
        onClearRoute={handleClearRoute}
        selectedVehicle={selectedVehicle}
        temperatureF={temperatureF}
      />

      <AnalyticsHUD
        totalStations={allStations.length}
        filteredCount={filteredStations.length}
      />

      {/* Modals */}
      <StationModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onSetAsDestination={handleSetStationAsDestination}
      />

      <ItineraryModal
        route={activeRoute}
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
      />

      <SavedRoutesModal
        isOpen={isSavedRoutesOpen}
        onClose={() => setIsSavedRoutesOpen(false)}
        activeRoute={activeRoute}
        selectedVehicle={selectedVehicle}
        temperatureF={temperatureF}
        onRestoreRoute={(originName, destinationName) => {
          const origin: RouteStop = { name: originName, coordinates: [-122.4194, 37.7749] };
          const destination: RouteStop = { name: destinationName, coordinates: [-120.0324, 39.0968] };
          handleCalculateRoute(origin, destination);
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold tracking-wide text-slate-300">
              Initializing Amazon Location & EV Spatial Layers...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
