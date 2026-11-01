import { RouteResult } from '../types';
import { VehicleProfile } from './vehicleProfiles';

export interface SavedRouteItem {
  id: string;
  name: string;
  createdAt: string;
  originName: string;
  destinationName: string;
  distanceMiles: number;
  durationMinutes: number;
  carbonSavedLbs: number;
  vehicleName: string;
  temperatureF: number;
}

const STORAGE_KEY = 'ecoroute_saved_trips_v1';

export function getSavedRoutes(): SavedRouteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved routes from localStorage:', err);
    return [];
  }
}

export function saveRouteToStorage(
  route: RouteResult,
  vehicle: VehicleProfile,
  temperatureF: number,
  customName?: string
): SavedRouteItem {
  const routes = getSavedRoutes();
  const newItem: SavedRouteItem = {
    id: 'route-' + Date.now(),
    name: customName || `${route.origin.name.split('(')[0].trim()} to ${route.destination.name.split('(')[0].trim()}`,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    originName: route.origin.name,
    destinationName: route.destination.name,
    distanceMiles: route.distanceMiles,
    durationMinutes: route.durationMinutes,
    carbonSavedLbs: route.carbonSavedLbs,
    vehicleName: `${vehicle.brand} ${vehicle.name}`,
    temperatureF,
  };

  const updated = [newItem, ...routes.slice(0, 19)]; // Keep up to 20 saved trips
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist route to localStorage:', err);
  }
  return newItem;
}

export function deleteSavedRoute(id: string): SavedRouteItem[] {
  const routes = getSavedRoutes().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch (err) {
    console.error('Failed to update localStorage after deletion:', err);
  }
  return routes;
}

