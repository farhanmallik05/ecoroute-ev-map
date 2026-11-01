export type ChargingLevel = 'DC_FAST' | 'LEVEL_2';

export interface EVStationProperties {
  id: string;
  name: string;
  operator: string;
  level: ChargingLevel;
  power_kw: number;
  ports_total: number;
  ports_available: number;
  connectors: string[];
  address: string;
  city: string;
  state: string;
  pricing: string;
  renewable_pct: number;
  amenities: string[];
}

export interface EVStationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: EVStationProperties;
}

export interface EVStationCollection {
  type: 'FeatureCollection';
  features: EVStationFeature[];
}

export interface RouteStop {
  name: string;
  coordinates: [number, number];
}

export interface RouteResult {
  origin: RouteStop;
  destination: RouteStop;
  distanceMiles: number;
  durationMinutes: number;
  carbonSavedLbs: number;
  gasGallonsSaved: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  stationsAlongRoute: EVStationFeature[];
}

export interface FilterState {
  minPowerKw: number;
  operator: string;
  connector: string;
  onlyAvailable: boolean;
  minRenewablePct: number;
}

