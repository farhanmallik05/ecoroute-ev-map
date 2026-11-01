# EcoRoute EV Corridor & Elevation Planner: Complete Master Guide
**Challenge:** AWS Builder Center — Weekend Challenge: Map it  
**Author:** AWS Builder Center Engineering Team  
**Tech Stack:** React 18, Vite 5, TypeScript, MapLibre GL JS, Turf.js, Amazon Location Service  

---

## Table of Contents
1. [Part 1: LEARN (Architecture & Algorithmic Teardown)](#part-1-learn)
   - [1.1 Background & The Real-World EV Problem](#11-background--the-real-world-ev-problem)
   - [1.2 System Architecture & Component Hierarchy](#12-system-architecture--component-hierarchy)
   - [1.3 Topographical Elevation & Gravitational Energy Physics](#13-topographical-elevation--gravitational-energy-physics)
   - [1.4 Turf.js Geospatial Corridor Buffering & Reach Isochrones](#14-turfjs-geospatial-corridor-buffering--reach-isochrones)
   - [1.5 Multi-Vehicle Profiles & Temperature Degradation Model](#15-multi-vehicle-profiles--temperature-degradation-model)
   - [1.6 Dynamic Stall Occupancy & Queue Wait-Time Simulator](#16-dynamic-stall-occupancy--queue-wait-time-simulator)
   - [1.7 Amazon Location Service Integration](#17-amazon-location-service-integration)
2. [Part 2: USE (Developer & Driver Walkthrough)](#part-2-use)
   - [2.1 Local Environment Setup & Prerequisites](#21-local-environment-setup--prerequisites)
   - [2.2 Launching the Development Server](#22-launching-the-development-server)
   - [2.3 Running the Geospatial Test Suite](#23-running-the-geospatial-test-suite)
   - [2.4 Step-by-Step Feature Walkthrough](#24-step-by-step-feature-walkthrough)
   - [2.5 Offline Route Bookmarking & Itinerary Export](#25-offline-route-bookmarking--itinerary-export)
3. [Part 3: HOST & DEPLOY (Production AWS Cloud Deployment)](#part-3-host--deploy)
   - [3.1 AWS Architecture Topology](#31-aws-architecture-topology)
   - [3.2 Provisioning Amazon S3 & CloudFront via AWS CLI](#32-provisioning-amazon-s3--cloudfront-via-aws-cli)
   - [3.3 Amazon Location Service Cognito Identity Configuration](#33-amazon-location-service-cognito-identity-configuration)
   - [3.4 Production CI/CD with GitHub Actions](#34-production-cicd-with-github-actions)
   - [3.5 CloudWatch Telemetry, Alarms & Cost Analysis](#35-cloudwatch-telemetry-alarms--cost-analysis)

---

# Part 1: LEARN

### 1.1 Background & The Real-World EV Problem
Electric vehicle drivers face a significant psychological and logistical hurdle known as **Range Anxiety**. Standard navigation systems (like Google Maps or Apple Maps) estimate driving range assuming a flat 2D plane and average vehicle speed. 

In reality, driving through mountainous highway corridors (such as California Interstate 80 from San Francisco at sea level up to Donner Summit at 7,239 feet) drastically distorts battery consumption:
1. **Gravitational Potential Energy Loss:** Climbing a 6% grade requires up to $3\times$ the energy per mile compared to flat cruising.
2. **Regenerative Braking Recovery:** Descending steep grades allows the EV induction motor to act as a generator, recovering up to 65% of potential energy back into the lithium-ion cells.
3. **Ambient Temperature & Cabin HVAC:** In winter (e.g. 20°F at Lake Tahoe), battery internal resistance spikes and cabin resistive heaters or heat pumps draw 3–5 kW continuously, reducing effective range by 25%–35%.

**EcoRoute** solves this by unifying:
- Client-side geospatial corridor buffering along real highway paths.
- Topographical elevation cross-section modeling with regenerative recovery curves.
- Multi-vehicle battery profiles (Tesla, Rivian, Hyundai, Ford, Chevy).
- Renewable clean energy grid mix telemetry (solar vs wind vs fossil).

---

### 1.2 System Architecture & Component Hierarchy

The application follows a strictly decoupled, unidirectional React 18 component structure:

```
src/
├── main.tsx                    # React DOM entry point
├── App.tsx                     # Top-level state coordinator & modal manager
├── types/index.ts              # Core GeoJSON & Routing TypeScript definitions
├── components/
│   ├── MapView.tsx             # MapLibre GL WebGL canvas & GeoJSON vector layers
│   ├── Navbar.tsx              # Quick actions, search bar & modal toggles
│   ├── SearchBar.tsx           # Instant geocoding & camera flyTo locator
│   ├── RoutePlannerDrawer.tsx  # Origin/Destination selector & elevation summary
│   ├── ElevationChart.tsx      # SVG elevation cross-section & battery curve
│   ├── VehicleSelector.tsx     # EV model picker, SoC slider & temperature slider
│   ├── StationModal.tsx        # Live stall telemetry, grid mix & queue wait time
│   ├── ItineraryModal.tsx      # Turn-by-turn driver manifest with JSON export
│   ├── SavedRoutesModal.tsx    # LocalStorage corridor bookmark manager
│   ├── FilterSidebar.tsx       # Power kW, operator, & connector filter drawer
│   ├── AnalyticsHUD.tsx        # Real-time station counter & active filters badge
│   └── ErrorBoundary.tsx       # WebGL failure resilience wrapper
└── utils/
    ├── geoUtils.ts             # Turf.js line buffering, bounding box & CO2 math
    ├── elevationUtils.ts       # Topographical spline, ascent/descent & regen curve
    ├── isochroneUtils.ts       # Turf.js dynamic range reach circles
    ├── vehicleProfiles.ts      # EV battery capacity, EPA range & temperature penalty
    ├── occupancySimulator.ts   # Dynamic stall status & queue wait time estimator
    └── storageUtils.ts         # LocalStorage persistence & corridor restoration
```

---

### 1.3 Topographical Elevation & Gravitational Energy Physics

The physics model implemented in `src/utils/elevationUtils.ts` uses classical Newtonian energy conservation combined with empirical EV dynamometer curves:

$$E_{\text{total}} = E_{\text{flat}} + E_{\text{gravity}} - E_{\text{regen}} + E_{\text{HVAC}}$$

Where:
- $E_{\text{flat}} = d \times \left(\frac{\text{Wh}}{\text{mi}}\right) \times 10^{-3} \text{ kWh}$
- $E_{\text{climb}} = \Delta h_{\text{ascent}} \times 0.003 \text{ kWh / foot}$
- $E_{\text{regen}} = |\Delta h_{\text{descent}}| \times 0.002 \text{ kWh / foot}$ (66.7% recovery efficiency)
- $E_{\text{HVAC}} = \text{Penalty}(T_{\text{ambient}})$ where $T < 70^{\circ}\text{F}$ introduces a $+0.4\%$ consumption penalty per degree Fahrenheit.

```typescript
// From src/utils/elevationUtils.ts
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
```

---

### 1.4 Turf.js Geospatial Corridor Buffering & Reach Isochrones

Rather than searching for charging stations in an unconstrained radius, EcoRoute builds an intelligent **highway corridor polygon**:
1. It takes the route `LineString` from origin to destination.
2. It uses `turf.buffer(lineString, 15, { units: 'miles' })` to create a 30-mile wide corridor envelope.
3. It iterates over the 60+ stations in `public/data/ev_stations.geojson` and applies `turf.booleanPointInPolygon(stationPoint, corridorBuffer)`.
4. Only stations strictly within easy highway divergence are included in the itinerary.

```typescript
// From src/utils/geoUtils.ts
const line = turf.lineString(interpolatedPoints);
const corridor = turf.buffer(line, corridorWidthMiles, { units: 'miles' });

const stationsAlongRoute = allStations.filter((station) => {
  return turf.booleanPointInPolygon(station.geometry.coordinates, corridor);
});
```

---

### 1.5 Multi-Vehicle Profiles & Temperature Degradation Model

`src/utils/vehicleProfiles.ts` defines five representative EV platforms:

| Vehicle | Battery Pack | EPA Base Range | Efficiency | Max Charge Rate | Plug Standard | Winter Penalty (20°F) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Tesla Model 3 Long Range** | 82 kWh | 341 mi | 240 Wh/mi | 250 kW | NACS / CCS | -22% |
| **Rivian R1T Dual-Motor Max** | 141 kWh | 410 mi | 343 Wh/mi | 220 kW | CCS / NACS | -26% |
| **Hyundai Ioniq 5 AWD** | 77.4 kWh | 260 mi | 297 Wh/mi | 350 kW (800V) | CCS | -25% |
| **Ford F-150 Lightning Extended** | 131 kWh | 320 mi | 410 Wh/mi | 155 kW | CCS | -32% |
| **Chevy Bolt EUV Premier** | 65 kWh | 247 mi | 263 Wh/mi | 55 kW | CCS | -30% |

The dynamic isochrone circle expands or contracts in real-time as the driver drags the battery SoC slider (10%–100%) or adjusts the ambient temperature (0°F–110°F).

---

### 1.6 Dynamic Stall Occupancy & Queue Wait-Time Simulator

`src/utils/occupancySimulator.ts` calculates real-time stall availability and queue delays:
- If `ports_available > 0`, queue wait time is **0 minutes** (`AVAILABLE_NOW`).
- If all stalls are in use, it simulates each charging stall's current State of Charge ($40\% - 85\%$) and computes time-to-full ($90\%$) based on the charger's max power ($350\text{ kW}$ vs $50\text{ kW}$).
- Estimated queue delay equals the minimum remaining minutes among active stalls.

---

### 1.7 Amazon Location Service Integration

The map engine uses **MapLibre GL JS**, the open-source fork of Mapbox GL that is natively supported and recommended by AWS.
- **Tiles:** Loaded over HTTPS from CartoDB / Amazon Location Service vector tile endpoints.
- **Clustering:** Hardware-accelerated Supercluster grouping enables fluid 60fps rendering of thousands of station markers with automatic level-of-detail expansion on zoom.

---

# Part 2: USE

### 2.1 Local Environment Setup & Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node.js v20.x and v24.x).
- **Package Manager:** `npm` (included with Node.js).
- **Operating System:** Windows, macOS, or Linux.

### 2.2 Launching the Development Server
```powershell
# Navigate into the project folder
cd "d:\AI-Lab\Hackathon\AWS Hackathons\weekend-challenge-map-it"

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```
Open your browser to: **`http://localhost:3000`**

### 2.3 Running the Geospatial Test Suite
EcoRoute includes a headless automated test suite verifying all geospatial calculations, elevation splines, vehicle profiles, and stall occupancy algorithms:
```powershell
npm test
```
**Expected Output:**
```
🧪 Running EcoRoute Geospatial Engine Test Suite...

✅ Test 1 Passed: calculateEnvironmentalImpact produces accurate metrics.
✅ Test 2 Passed: calculateElevationAndBatteryProfile accurately simulates mountain ascents and regen.
✅ Test 3 Passed: generateRangeReachPolygon outputs valid GeoJSON Polygon with range.
✅ Test 4 Passed: generateRouteGeometry computes corridor buffering accurately.
✅ Test 5 Passed: calculateEffectiveRange accurately penalizes cold weather temperatures.
✅ Test 6 Passed: simulateStationOccupancy accurately models stall queues.

🎉 ALL 6 GEOSPATIAL TESTS PASSED SUCCESSFULLY!
```

### 2.4 Step-by-Step Feature Walkthrough
1. **Interactive Station Inspection:** Click any green cluster circle or individual station marker to open the **Station Modal**. Inspect the live stall telemetry (open stalls vs in-use with remaining countdown), renewable grid percentage, and max charging speed.
2. **Search & Fly-To:** Type `"Sacramento"`, `"Tahoe"`, or `"Davis"` in the top search bar. Select a result to fly the camera directly to that hub.
3. **Trip Planning:** Click **Plan Trip** in the top navbar. Select *San Francisco* as Origin and *Lake Tahoe* as Destination. Click **Calculate Optimal EcoRoute**.
4. **Elevation & Battery Inspection:** In the drawer, inspect the elevation cross-section graph showing the ascent to Donner Pass and the battery depletion curve.
5. **Vehicle & Weather Tuning:** Click **Vehicle & Temp** in the navbar. Switch from *Tesla Model 3* to *Rivian R1T* or *Ford F-150*. Lower the temperature slider to 20°F and observe the isochrone range circle contract.
6. **Driver Itinerary Export:** Click **Itinerary** in the navbar. Review the stepped driver schedule, dwell times, and click **Export Itinerary (JSON)** to copy the payload.

### 2.5 Offline Route Bookmarking & Itinerary Export
- Click **Saved Trips** in the navbar to open the `SavedRoutesModal`.
- Click **Save Route** to bookmark the current corridor.
- Bookmarks are persisted in browser `localStorage` and can be restored with a single click.

---

# Part 3: HOST & DEPLOY

### 3.1 AWS Architecture Topology

```
[ User Browser ]
       │
       ▼ (HTTPS / TLS 1.3)
[ Amazon CloudFront (Global Edge CDN) ]
       │
       ├── Origin 1: [ Amazon S3 Bucket ] (React 18 Static Web Assets /dist)
       │
       └── Origin 2: [ Amazon Location Service ]
                         ├── Places Index (Reverse Geocoding)
                         └── Map Resource (Vector Tiles via Cognito Identity Pool)
```

---

### 3.2 Provisioning Amazon S3 & CloudFront via AWS CLI

#### Step 1: Create an S3 Bucket
```powershell
# Set environment variables
$BUCKET_NAME = "ecoroute-ev-map-production-$(Get-Random)"
$REGION = "us-east-1"

# Create private S3 bucket
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION

# Enable bucket encryption
aws s3api put-bucket-encryption --bucket $BUCKET_NAME --server-side-encryption-configuration '{
  "Rules": [{ "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "AES256" } }]
}'

# Block all public direct access (CloudFront will use Origin Access Control)
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration '{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": true,
  "RestrictPublicBuckets": true
}'
```

#### Step 2: Build and Deploy the Static Assets
```powershell
# Compile production bundle with Rollup code-splitting
npm run build

# Sync dist/ directory to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --cache-control "max-age=31536000,public"
# Ensure index.html is never cached indefinitely
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html --cache-control "max-age=0,must-revalidate"
```

#### Step 3: Create CloudFront Distribution with Origin Access Control (OAC)
```powershell
# Create OAC
$OAC_ID = (aws cloudfront create-origin-access-control --origin-access-control-config '{
  "Name": "EcoRouteOAC",
  "Description": "OAC for EcoRoute S3 origin",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}' --query 'OriginAccessControl.Id' --output text)

# Deploy CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "ecoroute-' + (Get-Date).Ticks + '",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-EcoRoute",
      "DomainName": "' + $BUCKET_NAME + '.s3.amazonaws.com",
      "OriginAccessControlId": "' + $OAC_ID + '",
      "S3OriginConfig": { "OriginAccessIdentity": "" }
    }]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-EcoRoute",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] },
    "ForwardedValues": { "QueryString": false, "Cookies": { "Forward": "none" } },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 10
    }]
  },
  "Comment": "EcoRoute EV Corridor Navigator",
  "Enabled": true
}'
```

---

### 3.3 Amazon Location Service Cognito Identity Configuration

To bind Amazon Location Service maps with authenticated or unauthenticated guest access:
```powershell
# 1. Create Cognito Identity Pool for unauthenticated guest map access
$POOL_ID = (aws cognito-identity create-identity-pool `
  --identity-pool-name "EcoRouteGuestPool" `
  --allow-unauthenticated-identities `
  --query 'IdentityPoolId' --output text)

# 2. Attach least-privilege IAM policy granting GetMapGlyphs, GetMapSprites, GetMapTile
aws iam put-role-policy --role-name "Cognito_EcoRouteUnauthRole" --policy-name "AmazonLocationMapAccess" --policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "geo:GetMapGlyphs",
      "geo:GetMapSprites",
      "geo:GetMapTile",
      "geo:SearchPlaceIndexForText"
    ],
    "Resource": "arn:aws:geo:us-east-1:*:map/EcoRouteMap"
  }]
}'
```

---

### 3.4 Production CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy EcoRoute to AWS CloudFront

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      - name: Build Production Distribution
        run: npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync S3 Bucket
        run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete

      - name: Invalidate CloudFront Cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

---

### 3.5 CloudWatch Telemetry, Alarms & Cost Analysis

#### Monthly Cost Estimate (10,000 active monthly drivers):
- **Amazon S3 Storage (54 kB entry bundle + 1.2 MB total assets):** < $0.01 / month.
- **Amazon CloudFront Data Transfer Out (10,000 visits × 1.2 MB = 12 GB):** $0.00 (under 1 TB free tier).
- **Amazon Location Service Tile Requests (10,000 sessions × 15 tiles = 150,000 tiles):** $0.00 (under 250,000 free requests/mo).
- **Total Production Operating Cost:** **$0.00 / month (100% within AWS Free Tier)**.

