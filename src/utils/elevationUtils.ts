/**
 * Elevation profile and EV battery consumption modeling.
 * Models real-world gravitational potential energy, vehicle aerodynamics,
 * and temperature HVAC impacts on battery performance.
 */
import type { VehicleProfile } from './vehicleProfiles.ts';

export interface ElevationPoint {
  distanceMile: number;
  elevationFeet: number;
  gradePct: number;
  batteryPctRemaining: number;
}

export interface ElevationProfileResult {
  points: ElevationPoint[];
  totalAscentFeet: number;
  totalDescentFeet: number;
  netEnergyConsumedKwh: number;
  regenEnergyGainedKwh: number;
  finalBatteryPct: number;
  hvacPenaltyKwh: number;
}

/**
 * Simulates a realistic topographical elevation profile and battery drainage curve
 * for California highway corridors (e.g. SF -> Lake Tahoe climbs from sea level to 7,200 ft).
 */
export function calculateElevationAndBatteryProfile(
  distanceMiles: number,
  initialBatteryPct: number = 90,
  batteryCapacityKwh: number = 77,
  vehicleProfile?: VehicleProfile,
  temperatureF: number = 70
): ElevationProfileResult {
  const numSamples = 25;
  const points: ElevationPoint[] = [];

  const effectiveCapacity = vehicleProfile ? vehicleProfile.batteryCapacityKWh : batteryCapacityKwh;
  const baseWhPerMile = vehicleProfile ? vehicleProfile.efficiencyWhPerMile : 280;
  const baseKwhPerMile = baseWhPerMile / 1000;

  // Temperature efficiency multiplier (HVAC heating/cooling penalty)
  let tempMultiplier = 1.0;
  if (temperatureF < 70) {
    const coldPenalty = (70 - temperatureF) * 0.004; // 20F gives ~20% penalty
    tempMultiplier += coldPenalty;
  } else if (temperatureF > 85) {
    const heatPenalty = (temperatureF - 85) * 0.003;
    tempMultiplier += heatPenalty;
  }

  let currentElevation = 50; // SF Sea level
  let totalAscent = 0;
  let totalDescent = 0;
  let energyConsumedKwh = 0;
  let regenKwh = 0;
  let batteryPct = initialBatteryPct;

  const mileStep = distanceMiles / numSamples;

  for (let i = 0; i <= numSamples; i++) {
    const dist = Math.round(i * mileStep);
    const progress = i / numSamples;

    // Simulate elevation profile: flat in Central Valley, steep climb in Sierra Nevada foothills
    let targetElevation: number;
    if (progress < 0.4) {
      targetElevation = 50 + progress * 150; // Central Valley flat
    } else if (progress < 0.85) {
      targetElevation = 150 + Math.pow((progress - 0.4) / 0.45, 2) * 5800; // Steep climb up Donner / Echo Summit
    } else {
      targetElevation = 6200 - (progress - 0.85) * 800; // Lake Tahoe basin
    }

    const elevationDelta = targetElevation - currentElevation;
    if (elevationDelta > 0) {
      totalAscent += elevationDelta;
    } else {
      totalDescent += Math.abs(elevationDelta);
    }

    const gradePct = dist > 0 ? Number(((elevationDelta / (mileStep * 5280)) * 100).toFixed(1)) : 0;
    currentElevation = targetElevation;

    // Base consumption adjusted for vehicle aerodynamics and HVAC
    const baseEnergy = mileStep * baseKwhPerMile * tempMultiplier;
    let climbEnergy = 0;
    if (elevationDelta > 0) {
      climbEnergy = elevationDelta * 0.003;
      energyConsumedKwh += baseEnergy + climbEnergy;
    } else {
      const recovered = Math.abs(elevationDelta) * 0.002;
      regenKwh += recovered;
      energyConsumedKwh += Math.max(0.05, baseEnergy - recovered);
    }

    // Battery percentage calculation
    const deltaBatteryPct = (energyConsumedKwh / effectiveCapacity) * 100;
    batteryPct = Math.max(2, Number((initialBatteryPct - deltaBatteryPct).toFixed(1)));

    points.push({
      distanceMile: dist,
      elevationFeet: Math.round(targetElevation),
      gradePct,
      batteryPctRemaining: batteryPct,
    });
  }

  const hvacPenaltyKwh = Number((energyConsumedKwh * (tempMultiplier - 1.0)).toFixed(1));

  return {
    points,
    totalAscentFeet: Math.round(totalAscent),
    totalDescentFeet: Math.round(totalDescent),
    netEnergyConsumedKwh: Number(energyConsumedKwh.toFixed(1)),
    regenEnergyGainedKwh: Number(regenKwh.toFixed(1)),
    finalBatteryPct: batteryPct,
    hvacPenaltyKwh: Math.max(0, hvacPenaltyKwh),
  };
}
