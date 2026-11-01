import * as turf from '@turf/turf';
import { calculateEffectiveRange } from './vehicleProfiles.ts';
import type { VehicleProfile } from './vehicleProfiles.ts';

export interface IsochroneFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    batteryPct: number;
    rangeMiles: number;
    temperatureF: number;
    vehicleName: string;
    label: string;
    color: string;
  };
}

/**
 * Generates an isochrone range reach polygon centered at [lon, lat]
 * based on remaining battery percentage, vehicle profile and temperature.
 */
export function generateRangeReachPolygon(
  centerCoords: [number, number],
  batteryPct: number = 80,
  vehicleOrMaxRange: VehicleProfile | number = 280,
  temperatureF: number = 70
): IsochroneFeature {
  let estimatedMiles: number;
  let vehicleName = 'Generic EV';

  if (typeof vehicleOrMaxRange === 'number') {
    estimatedMiles = Math.round((batteryPct / 100) * vehicleOrMaxRange);
  } else {
    estimatedMiles = calculateEffectiveRange(vehicleOrMaxRange, batteryPct, temperatureF);
    vehicleName = `${vehicleOrMaxRange.brand} ${vehicleOrMaxRange.name}`;
  }

  const centerPoint = turf.point(centerCoords);

  // Generate 64-step circle polygon
  const circle = turf.circle(centerPoint, Math.max(1, estimatedMiles), {
    steps: 64,
    units: 'miles',
    properties: {
      batteryPct,
      rangeMiles: estimatedMiles,
      temperatureF,
      vehicleName,
      label: `${estimatedMiles} mi Range (${batteryPct}%) @ ${temperatureF}°F`,
      color: batteryPct > 50 ? '#10b981' : batteryPct > 20 ? '#f59e0b' : '#ef4444',
    },
  });

  return circle as unknown as IsochroneFeature;
}
