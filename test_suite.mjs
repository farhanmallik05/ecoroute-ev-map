import assert from 'node:assert';
import { calculateEnvironmentalImpact, findStationsAlongCorridor, generateRouteGeometry, POPULAR_DESTINATIONS } from './src/utils/geoUtils.ts';
import { calculateElevationAndBatteryProfile } from './src/utils/elevationUtils.ts';
import { generateRangeReachPolygon } from './src/utils/isochroneUtils.ts';
import { POPULAR_EV_PROFILES, calculateEffectiveRange } from './src/utils/vehicleProfiles.ts';
import { simulateStationOccupancy } from './src/utils/occupancySimulator.ts';

console.log('🧪 Running EcoRoute Geospatial Engine Test Suite...\n');

// Test 1: Environmental Impact
{
  const impact = calculateEnvironmentalImpact(100);
  assert.strictEqual(impact.gasGallonsSaved, 4);
  assert.strictEqual(impact.carbonSavedLbs, 78.6);
  assert.strictEqual(impact.energyKwhEstimated, 32);
  console.log('✅ Test 1 Passed: calculateEnvironmentalImpact produces accurate metrics.');
}

// Test 2: Elevation & Battery Profile Modeling
{
  const profile = calculateElevationAndBatteryProfile(180, 90, 77);
  assert.strictEqual(profile.points.length, 26);
  assert.ok(profile.totalAscentFeet > 5000, 'Ascent should be greater than 5000ft for Sierra route');
  assert.ok(profile.regenEnergyGainedKwh > 0, 'Regen braking should recover energy on descent');
  assert.ok(profile.finalBatteryPct > 0 && profile.finalBatteryPct < 90, 'Battery should be properly modeled');
  console.log('✅ Test 2 Passed: calculateElevationAndBatteryProfile accurately simulates mountain ascents and regen.');
}

// Test 3: Isochrone Range Reach Polygon
{
  const iso = generateRangeReachPolygon([-122.4194, 37.7749], 80, 260);
  assert.strictEqual(iso.type, 'Feature');
  assert.strictEqual(iso.geometry.type, 'Polygon');
  assert.strictEqual(iso.properties.rangeMiles, 208);
  console.log('✅ Test 3 Passed: generateRangeReachPolygon outputs valid GeoJSON Polygon with range.');
}

// Test 4: Route Geometry & Corridor Buffering
{
  const mockStations = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-121.5, 38.24] },
      properties: { id: 'st-01', name: 'Valley Charger', power_kw: 150 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-115.0, 32.0] }, // Far away
      properties: { id: 'st-02', name: 'Desert Charger', power_kw: 50 }
    }
  ];

  const route = generateRouteGeometry(POPULAR_DESTINATIONS.SF, POPULAR_DESTINATIONS.TAHOE, mockStations);
  assert.ok(route.distanceMiles > 150);
  assert.ok(route.durationMinutes > 120);
  assert.strictEqual(route.geometry.type, 'LineString');
  assert.strictEqual(route.stationsAlongRoute.length, 1);
  assert.strictEqual(route.stationsAlongRoute[0].properties.id, 'st-01');
  console.log('✅ Test 4 Passed: generateRouteGeometry computes corridor buffering accurately.');
}

// 5. Test Vehicle Profile & Weather Temperature Sensitivity
{
  const tesla = POPULAR_EV_PROFILES[0];
  const idealRange = calculateEffectiveRange(tesla, 100, 70);
  const winterRange = calculateEffectiveRange(tesla, 100, 20);
  assert.strictEqual(idealRange, tesla.baseRangeMiles);
  assert.ok(winterRange < idealRange, 'Winter range must be lower than ideal range');
  assert.ok(winterRange > 200, 'Winter range should remain above 200 miles for Tesla M3 LR');
  console.log('✅ Test 5 Passed: calculateEffectiveRange accurately penalizes cold weather temperatures.');
}

// 6. Test Live Stall Occupancy & Queue Wait Simulator
{
  const testStation = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-121.4944, 38.5816] },
    properties: {
      id: 'test-st',
      name: 'Sacramento Fast Hub',
      operator: 'Electrify America',
      power_kw: 350,
      ports_total: 8,
      ports_available: 0, // Fully occupied
      connectors: ['CCS', 'NACS / Tesla'],
      renewable_pct: 85,
    },
  };

  const report = simulateStationOccupancy(testStation);
  assert.strictEqual(report.totalStalls, 8);
  assert.strictEqual(report.availableStalls, 0);
  assert.strictEqual(report.stalls.length, 8);
  assert.ok(report.estimatedQueueMinutes > 0, 'Estimated queue wait must be > 0 when all stalls are in use');
  assert.ok(report.statusBadge === 'SHORT_WAIT' || report.statusBadge === 'HIGH_DEMAND');
  console.log('✅ Test 6 Passed: simulateStationOccupancy accurately models stall queues.');
}

console.log('\n🎉 ALL 6 GEOSPATIAL TESTS PASSED SUCCESSFULLY!');
