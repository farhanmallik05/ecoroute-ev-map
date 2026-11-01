export interface VehicleProfile {
  id: string;
  name: string;
  brand: string;
  batteryCapacityKWh: number;
  baseRangeMiles: number;
  efficiencyWhPerMile: number;
  maxChargeRateKW: number;
  plugTypes: string[];
  imageIcon: string;
  winterPenaltyRatio: number; // multiplier at 20°F (e.g. 0.72 = 28% loss)
}

export const POPULAR_EV_PROFILES: VehicleProfile[] = [
  {
    id: 'tesla-m3-lr',
    name: 'Model 3 Long Range',
    brand: 'Tesla',
    batteryCapacityKWh: 82,
    baseRangeMiles: 341,
    efficiencyWhPerMile: 240,
    maxChargeRateKW: 250,
    plugTypes: ['NACS / Tesla', 'CCS'],
    imageIcon: '🚗',
    winterPenaltyRatio: 0.78,
  },
  {
    id: 'rivian-r1t',
    name: 'R1T Dual-Motor Max',
    brand: 'Rivian',
    batteryCapacityKWh: 141,
    baseRangeMiles: 410,
    efficiencyWhPerMile: 343,
    maxChargeRateKW: 220,
    plugTypes: ['CCS', 'NACS / Tesla'],
    imageIcon: '🛻',
    winterPenaltyRatio: 0.74,
  },
  {
    id: 'hyundai-ioniq5',
    name: 'Ioniq 5 AWD Long Range',
    brand: 'Hyundai',
    batteryCapacityKWh: 77.4,
    baseRangeMiles: 260,
    efficiencyWhPerMile: 297,
    maxChargeRateKW: 350, // 800V architecture ultra-fast charging
    plugTypes: ['CCS'],
    imageIcon: '⚡',
    winterPenaltyRatio: 0.75,
  },
  {
    id: 'ford-f150-lightning',
    name: 'F-150 Lightning Extended',
    brand: 'Ford',
    batteryCapacityKWh: 131,
    baseRangeMiles: 320,
    efficiencyWhPerMile: 410,
    maxChargeRateKW: 155,
    plugTypes: ['CCS'],
    imageIcon: '🚚',
    winterPenaltyRatio: 0.68,
  },
  {
    id: 'chevy-bolt-euv',
    name: 'Bolt EUV Premier',
    brand: 'Chevrolet',
    batteryCapacityKWh: 65,
    baseRangeMiles: 247,
    efficiencyWhPerMile: 263,
    maxChargeRateKW: 55,
    plugTypes: ['CCS'],
    imageIcon: '🚙',
    winterPenaltyRatio: 0.70,
  },
];

/**
 * Calculates effective range considering vehicle efficiency and ambient temperature.
 * Formula: Ideal range at 70°F. Linear or curve degradation below 50°F and above 95°F.
 */
export function calculateEffectiveRange(
  profile: VehicleProfile,
  batteryPct: number,
  temperatureF: number = 70
): number {
  let tempFactor = 1.0;

  if (temperatureF < 70) {
    // Below 70F, battery internal resistance increases & cabin heating kicks in
    // At 20F, reaches profile.winterPenaltyRatio
    const t = Math.max(0, (temperatureF - 20) / (70 - 20)); // 0 at 20F, 1 at 70F
    tempFactor = profile.winterPenaltyRatio + t * (1.0 - profile.winterPenaltyRatio);
    if (temperatureF < 20) {
      // Sub-freezing severe penalty
      tempFactor *= Math.max(0.5, 1.0 - (20 - temperatureF) * 0.01);
    }
  } else if (temperatureF > 85) {
    // Extreme heat requires heavy A/C compressor and battery pack cooling
    const heatDelta = temperatureF - 85;
    tempFactor = Math.max(0.75, 1.0 - heatDelta * 0.007);
  }

  const theoreticalFullRange = profile.baseRangeMiles * tempFactor;
  const currentRange = Math.round((batteryPct / 100) * theoreticalFullRange);
  return Math.max(5, currentRange);
}

