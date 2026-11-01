/**
 * Real-time EV Stall Occupancy and Queue Wait Time Simulator.
 * Simulates dynamic charger stall usage patterns and queue delays based on station power kW.
 */
import type { EVStationFeature } from '../types/index.ts';

export interface StallStatus {
  stallNumber: number;
  plugType: string;
  powerKw: number;
  status: 'AVAILABLE' | 'CHARGING' | 'OFFLINE';
  socPct?: number;
  remainingMinutes?: number;
}

export interface StationOccupancyReport {
  stationId: string;
  totalStalls: number;
  availableStalls: number;
  chargingStalls: number;
  offlineStalls: number;
  stalls: StallStatus[];
  estimatedQueueMinutes: number;
  statusBadge: 'AVAILABLE_NOW' | 'SHORT_WAIT' | 'HIGH_DEMAND' | 'OFFLINE';
}

export function simulateStationOccupancy(station: EVStationFeature): StationOccupancyReport {
  const p = station.properties;
  const totalStalls = p.ports_total || 6;
  const powerKw = p.power_kw || 150;
  const primaryPlug = p.connectors[0] || 'CCS';
  const secondaryPlug = p.connectors[1] || 'NACS / Tesla';

  const stalls: StallStatus[] = [];
  let availableCount = p.ports_available;
  let offlineCount = 0;

  for (let i = 1; i <= totalStalls; i++) {
    const plug = i % 2 === 0 ? secondaryPlug : primaryPlug;
    if (i <= availableCount) {
      stalls.push({
        stallNumber: i,
        plugType: plug,
        powerKw,
        status: 'AVAILABLE',
      });
    } else {
      // Charging stall with simulated SoC and dwell time
      const pseudoRandomSeed = (station.geometry.coordinates[0] * 100 + i) % 1;
      const currentSoc = Math.floor(40 + Math.abs(pseudoRandomSeed) * 45); // 40% to 85%
      // 350kW charges faster than 50kW
      const minutesLeft = Math.max(3, Math.round((90 - currentSoc) * (150 / powerKw) * 0.4));

      stalls.push({
        stallNumber: i,
        plugType: plug,
        powerKw,
        status: 'CHARGING',
        socPct: currentSoc,
        remainingMinutes: minutesLeft,
      });
    }
  }

  const chargingCount = totalStalls - availableCount - offlineCount;

  // Calculate estimated queue wait time
  let estimatedQueueMinutes = 0;
  let statusBadge: 'AVAILABLE_NOW' | 'SHORT_WAIT' | 'HIGH_DEMAND' | 'OFFLINE' = 'AVAILABLE_NOW';

  if (availableCount > 0) {
    estimatedQueueMinutes = 0;
    statusBadge = 'AVAILABLE_NOW';
  } else {
    // If all occupied, minimum wait is lowest remaining minutes among charging stalls
    const remainingTimes = stalls
      .filter((s) => s.status === 'CHARGING' && s.remainingMinutes)
      .map((s) => s.remainingMinutes as number);
    estimatedQueueMinutes = remainingTimes.length > 0 ? Math.min(...remainingTimes) : 15;
    statusBadge = estimatedQueueMinutes <= 10 ? 'SHORT_WAIT' : 'HIGH_DEMAND';
  }

  return {
    stationId: p.id,
    totalStalls,
    availableStalls: availableCount,
    chargingStalls: chargingCount,
    offlineStalls: offlineCount,
    stalls,
    estimatedQueueMinutes,
    statusBadge,
  };
}
