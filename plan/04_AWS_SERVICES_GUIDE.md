# 04 — AWS Services Guide: Weekend Challenge: Map it

This guide provides deep technical instructions on configuring, integrating, and operating the AWS services required for a winning geospatial project on AWS.

---

## 🗺️ 1. Amazon Location Service Core Capabilities

Amazon Location Service is a managed cloud service that makes it easy to add maps, points of interest, geocoding, routing, tracking, and geofencing to your applications without compromising data privacy or building mapping engines from scratch.

### Comparison of the 5 Core Primitives

| Primitive | What It Does | Why You Need It | AWS API Methods |
| :--- | :--- | :--- | :--- |
| **Maps** | Serves vector or raster tiles styled by Esri, HERE, or Open Data. | Provides the interactive visual basemap canvas. | `GetMapTile`, `GetMapStyleDescriptor`, `GetMapGlyphs`, `GetMapSprites` |
| **Places (Place Index)** | Geocodes street addresses to lat/long coordinates; reverse geocodes coordinates to street names; auto-completes search text. | Powers your search bar (e.g., "Find San Francisco, CA" or "Search nearby chargers"). | `SearchPlaceIndexForText`, `SearchPlaceIndexForPosition`, `SearchPlaceIndexForSuggestions` |
| **Routes (Route Calculator)** | Computes fastest or shortest travel paths, travel times, distances, and turn-by-turn directions. | Draws road trip lines and navigation paths between origins, destinations, and waypoints. | `CalculateRoute`, `CalculateRouteMatrix` |
| **Geofences (Geofence Collections)** | Evaluates geographic boundaries (polygons). Detects entry, exit, and idle events. | Triggers alerts when vehicles/users cross specific zones (e.g. low-emission zones, hurricane areas). | `PutGeofence`, `BatchEvaluateGeofences`, `ListGeofences` |
| **Trackers** | Stores, queries, and filters position updates from mobile devices, sensors, or vehicles. | Records real-time movement history and feeds coordinates to geofence evaluators. | `BatchUpdateDevicePosition`, `GetDevicePosition`, `GetDevicePositionHistory` |

---

## 🛠️ 2. Recommended Configuration Settings

### Map Style Selection
When creating your Map resource, AWS offers several pre-built styles from Esri, HERE, and Open Data:

- **VectorEsriNavigation** *(Recommended for Navigation & EV)*: High contrast, emphasizes highway infrastructure, turnouts, and street geometry.
- **VectorHereExploreTruck** / **VectorHereExplore**: Excellent for logistics, bridge height restrictions, and transit data.
- **VectorOpenDataStandardLight** / **Dark**: OpenStreetMap-based basemaps, great for clean minimalist aesthetic.

### Data Provider Considerations
- **HERE**: Outstanding worldwide routing algorithms and traffic-aware travel time calculation.
- **Esri**: High-fidelity place searching, rich geographic layers, and crisp vector typography.

---

## 🔐 3. Authentication & Credential Architecture

Never commit AWS Access Keys (`AKIA...`) or Secret Keys to your frontend code. Follow this standard pattern:

### Method A: Amazon Cognito Identity Pools (Standard & Scalable)
1. Create a Cognito Identity Pool configured to allow unauthenticated identities.
2. The browser calls `CognitoIdentityCredentials`.
3. The temporary session token is passed to `AmazonLocationClient` or signed into map tile requests via `@aws-amplify/geo`.

### Method B: API Key (Fastest Setup for Hackathons)
Amazon Location Service now supports **API Keys** for read-only map tile and geocoding operations:
1. In the AWS Console -> Amazon Location Service -> **API Keys**.
2. Create an API Key with `AllowActions: ["geo:GetMap*"]`.
3. Restrict referrers to `localhost:3000`, `localhost:5173`, and your production Amplify domain.
4. Pass the API Key in your MapLibre GL request transform header: `?key=v1.public.ey...`

---

## ⚡ 4. Frontend Rendering Libraries

### MapLibre GL JS
MapLibre GL JS is the industry-standard, open-source WebGL mapping library fork of Mapbox GL JS v1.

```bash
npm install maplibre-gl @aws-sdk/client-location
```

### AWS Amplify Geo Helper
If you use Amplify, the `@aws-amplify/geo` package handles tile signing automatically:

```bash
npm install aws-amplify @aws-amplify/geo maplibre-gl-js-amplify
```

---

## 💰 5. AWS Free Tier & Cost Prevention

Amazon Location Service offers a generous **3-month Free Tier**:

| Operation Type | Free Tier Allocation (Per Month) | Overage Cost |
| :--- | :--- | :--- |
| **Map Tiles (Vector/Raster)** | Up to 500,000 tiles | \$0.04 per 1,000 tiles |
| **Geocoding / Places Searches** | Up to 1,000 requests | \$0.50 per 1,000 requests |
| **Route Calculations** | Up to 1,000 routes | \$0.50 per 1,000 routes |
| **Geofence Evaluations** | Up to 1,000 evaluations | \$0.20 per 1,000 evaluations |

### Hackathon Cost Defense Rules:
1. **Debounce User Input:** Add a 300ms debounce on your Place Index search bar so typing "San Francisco" triggers 1 API request instead of 13.
2. **Cluster Nearby Markers:** Use MapLibre GL's client-side clustering (`cluster: true`) so 10,000 EV stations render as aggregated count circles until zoomed in.
3. **Cache Invariant Datasets:** Host static GeoJSON files in Amazon S3 or a public GitHub CDN rather than repeatedly generating dynamic database queries.

