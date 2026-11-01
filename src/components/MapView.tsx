import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EVStationFeature, EVStationCollection, RouteResult } from '../types';
import { generateRangeReachPolygon } from '../utils/isochroneUtils';
import { VehicleProfile } from '../utils/vehicleProfiles';

interface MapViewProps {
  stations: EVStationCollection;
  onSelectStation: (station: EVStationFeature) => void;
  activeRoute: RouteResult | null;
  flyToCoords?: [number, number] | null;
  isIsochroneActive?: boolean;
  selectedVehicle?: VehicleProfile;
  batteryPct?: number;
  temperatureF?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  stations,
  onSelectStation,
  activeRoute,
  flyToCoords,
  isIsochroneActive = false,
  selectedVehicle,
  batteryPct = 80,
  temperatureF = 70,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Support custom Amazon Location Service API Key, Carto API Key, or clean watermark-free Esri Dark Gray (Amazon Location Partner)
    const cartoKey = import.meta.env.VITE_CARTO_API_KEY;
    const awsLocationKey = import.meta.env.VITE_AWS_LOCATION_API_KEY;
    const awsRegion = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    const awsMapName = import.meta.env.VITE_AWS_MAP_NAME || 'EcoRouteMap';

    let tileUrls: string[];
    let tileAttribution: string;

    if (awsLocationKey) {
      tileUrls = [
        `https://maps.geo.${awsRegion}.amazonaws.com/maps/v0/maps/${awsMapName}/tiles/{z}/{x}/{y}?key=${awsLocationKey}`,
      ];
      tileAttribution = '© Amazon Location Service, © HERE / Esri';
    } else if (cartoKey) {
      tileUrls = [
        `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
        `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
        `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
      ];
      tileAttribution = '© OpenStreetMap contributors, © CARTO';
    } else {
      // Pristine, zero-watermark Esri Dark Gray Canvas (Amazon Location Service official basemap partner)
      tileUrls = [
        'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ];
      tileAttribution = '© Esri, HERE, Garmin, © OpenStreetMap contributors, Amazon Location Partner';
    }

    const mapStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: tileUrls,
          tileSize: 256,
          attribution: tileAttribution,
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-120.9842, 37.4877], // California Center
      zoom: 6.8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // 1. Add EV Stations GeoJSON Source with Clustering
      map.addSource('ev-stations', {
        type: 'geojson',
        data: stations,
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 45,
      });

      // Cluster Outer Glow
      map.addLayer({
        id: 'clusters-glow',
        type: 'circle',
        source: 'ev-stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#10b981',
          'circle-opacity': 0.25,
          'circle-radius': ['step', ['get', 'point_count'], 24, 10, 32, 25, 42],
        },
      });

      // Cluster Inner Circle
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'ev-stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#059669', // Emerald
            10,
            '#0284c7', // Sky Blue
            25,
            '#f59e0b', // Amber
          ],
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 25, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Cluster Count Text
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'ev-stations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Unclustered Single EV Station Markers
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'ev-stations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#10b981',
          'circle-radius': 7,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#022c22',
        },
      });

      // Handle Cluster Click -> Zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('ev-stations') as maplibregl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          if (features[0].geometry.type === 'Point') {
            map.easeTo({
              center: features[0].geometry.coordinates as [number, number],
              zoom: zoom + 0.5,
            });
          }
        });
      });

      // Handle Station Click -> Open Modal
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const properties = feature.properties as any;

        const parsedProps = {
          ...properties,
          connectors: typeof properties.connectors === 'string' ? JSON.parse(properties.connectors) : properties.connectors,
          amenities: typeof properties.amenities === 'string' ? JSON.parse(properties.amenities) : properties.amenities,
        };

        const station: EVStationFeature = {
          type: 'Feature',
          geometry: feature.geometry as any,
          properties: parsedProps,
        };

        onSelectStation(station);
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update GeoJSON data when filters change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.isStyleLoaded() && map.getSource('ev-stations')) {
      const source = map.getSource('ev-stations') as maplibregl.GeoJSONSource;
      source.setData(stations);
    }
  }, [stations]);

  // Handle FlyTo on Search
  useEffect(() => {
    if (!mapRef.current || !flyToCoords) return;
    mapRef.current.flyTo({
      center: flyToCoords,
      zoom: 12,
      duration: 1800,
    });
  }, [flyToCoords]);

  // Isochrone Range Reach Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateIsochrone = () => {
      if (map.getLayer('isochrone-fill')) map.removeLayer('isochrone-fill');
      if (map.getLayer('isochrone-line')) map.removeLayer('isochrone-line');
      if (map.getSource('isochrone-source')) map.removeSource('isochrone-source');

      if (!isIsochroneActive) return;

      const center: [number, number] = activeRoute
        ? activeRoute.origin.coordinates
        : [-122.4194, 37.7749]; // SF Default

      const isoPolygon = generateRangeReachPolygon(
        center,
        batteryPct,
        selectedVehicle || 260,
        temperatureF
      );

      map.addSource('isochrone-source', {
        type: 'geojson',
        data: isoPolygon as any,
      });

      map.addLayer({
        id: 'isochrone-fill',
        type: 'fill',
        source: 'isochrone-source',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.12,
        },
      });

      map.addLayer({
        id: 'isochrone-line',
        type: 'line',
        source: 'isochrone-source',
        paint: {
          'line-color': '#34d399',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      });
    };

    if (map.isStyleLoaded()) {
      updateIsochrone();
    } else {
      map.once('load', updateIsochrone);
    }
  }, [isIsochroneActive, activeRoute, selectedVehicle, batteryPct, temperatureF]);

  // Update Route Polyline & Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateRouteLayer = () => {
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getSource('route-source')) map.removeSource('route-source');

      if (!activeRoute) return;

      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activeRoute.geometry,
        },
      });

      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 10,
          'line-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#34d399',
          'line-width': 4,
        },
      });

      const coordinates = activeRoute.geometry.coordinates;
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.fitBounds(bounds, { padding: 120, duration: 1200 });
    };

    if (map.isStyleLoaded()) {
      updateRouteLayer();
    } else {
      map.once('load', updateRouteLayer);
    }
  }, [activeRoute]);

  return <div ref={mapContainer} className="w-full h-screen" />;
};
