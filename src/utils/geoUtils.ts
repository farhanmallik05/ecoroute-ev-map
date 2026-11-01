import * as turf from '@turf/turf';
import type { EVStationFeature, EVStationCollection, RouteResult, RouteStop } from '../types/index.ts';

/**
 * Calculates environmental savings based on route distance.
 * Average gasoline car: ~25 MPG, ~19.6 lbs CO2 per gallon of gasoline.
 * Average EV: ~0.30 kWh / mile.
 */
export function calculateEnvironmentalImpact(distanceMiles: number) {
  const gasGallonsSaved = Number((distanceMiles / 25).toFixed(1));
  const carbonSavedLbs = Number((gasGallonsSaved * 19.64).toFixed(1));
  const energyKwhEstimated = Number((distanceMiles * 0.32).toFixed(1));

  return { gasGallonsSaved, carbonSavedLbs, energyKwhEstimated };
}

/**
 * Filters stations that fall within a given corridor radius (in miles) of a route polyline.
 */
export function findStationsAlongCorridor(
  routeCoordinates: [number, number][],
  allStations: EVStationFeature[],
  bufferMiles: number = 8
): EVStationFeature[] {
  if (!routeCoordinates || routeCoordinates.length < 2) return [];

  const line = turf.lineString(routeCoordinates);

  return allStations.filter((station) => {
    const pt = turf.point(station.geometry.coordinates);
    const distance = turf.pointToLineDistance(pt, line, { units: 'miles' });
    return distance <= bufferMiles;
  });
}

/**
 * Pre-defined routes connecting iconic California destinations with realistic road coordinates.
 */
export const POPULAR_DESTINATIONS: Record<string, RouteStop> = {
  SF: { name: 'San Francisco (Civic Center)', coordinates: [-122.4194, 37.7749] },
  TAHOE: { name: 'Lake Tahoe (Heavenly)', coordinates: [-120.0324, 38.9399] },
  LA: { name: 'Los Angeles (Downtown)', coordinates: [-118.2437, 34.0522] },
  YOSEMITE: { name: 'Yosemite National Park', coordinates: [-119.5383, 37.8651] },
  SAN_JOSE: { name: 'Silicon Valley (San Jose)', coordinates: [-121.8863, 37.3382] },
  SACRAMENTO: { name: 'Sacramento (Capitol)', coordinates: [-121.4944, 38.5816] },
};

/**
 * Generates an interpolated realistic road route polyline between two locations.
 */
export function generateRouteGeometry(
  origin: RouteStop,
  destination: RouteStop,
  allStations: EVStationFeature[]
): RouteResult {
  const start = turf.point(origin.coordinates);
  const end = turf.point(destination.coordinates);
  const directDistance = turf.distance(start, end, { units: 'miles' });
  const drivingFactor = 1.25; // Driving roads are ~25% longer than as-the-crow-flies
  const distanceMiles = Math.round(directDistance * drivingFactor);
  const durationMinutes = Math.round((distanceMiles / 65) * 60); // approx 65 mph avg

  // Create intermediate curve points
  const points: [number, number][] = [];
  const steps = 30;

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lng = origin.coordinates[0] + (destination.coordinates[0] - origin.coordinates[0]) * fraction;
    const lat = origin.coordinates[1] + (destination.coordinates[1] - origin.coordinates[1]) * fraction;

    // Add subtle curvature to simulate highway geometry
    const curveOffset = Math.sin(fraction * Math.PI) * 0.08;
    points.push([lng + curveOffset, lat + curveOffset * 0.4]);
  }

  const { carbonSavedLbs, gasGallonsSaved } = calculateEnvironmentalImpact(distanceMiles);
  const stationsAlongRoute = findStationsAlongCorridor(points, allStations, 10);

  return {
    origin,
    destination,
    distanceMiles,
    durationMinutes,
    carbonSavedLbs,
    gasGallonsSaved,
    geometry: {
      type: 'LineString',
      coordinates: points,
    },
    stationsAlongRoute,
  };
}

