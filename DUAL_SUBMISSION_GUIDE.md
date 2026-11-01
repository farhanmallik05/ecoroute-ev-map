# EcoRoute: Dual Hackathon Submission Strategy & Playbook

**Target Project:** EcoRoute EV Intelligent Corridor & Elevation Planner  
**Codebase:** `d:\AI-Lab\Hackathon\AWS Hackathons\weekend-challenge-map-it`  
**Dual Submission Targets:**
1. **Competition A:** *AWS Builder Center Weekend Challenge: Map it* (Oct 30 – Nov 2, 2026)
2. **Competition B:** *Open Geospatial & Climate Innovation / Clean Energy Hackathon* (Nov 2026)

---

## Executive Concept & Dual Pivot Strategy

EcoRoute is architected to win in two distinct judging categories without rewriting a single line of code:

```
                            ┌────────────────────────────────────────┐
                            │               EcoRoute                 │
                            │  Intelligent EV Corridor & Elevation   │
                            └───────────────────┬────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
  [ Track A: AWS Builder Center ]                               [ Track B: Climate / Open Geo ]
  "Weekend Challenge: Map it"                                    "Clean Energy & Open Mobility"
  ─────────────────────────────────                              ───────────────────────────────────
  • Core Value: AWS Spatial Services                             • Core Value: Decarbonization & Physics
  • Services: Amazon Location, Amplify, S3, Cognito              • Tech: NREL 45k+ Stations, Turf.js
  • Hook: Serverless sub-second geospatial vector maps          • Hook: 7,200ft Mountain Elevation & Temp
  • Narrative: Cloud architecture & AWS MapLibre SDK             • Narrative: Eliminating EV Range Anxiety
```

---

## 1. Track A: AWS Builder Center — "Weekend Challenge: Map it"
**Submission Window:** October 30, 2026 – November 2, 2026  
**Primary Criteria:** Best use of an AWS Location or spatial data service, cloud architecture, and functional mapping.

### Form Inputs for AWS Builder Center
- **Project Title:** `EcoRoute — Intelligent EV Corridor & Elevation Planner`
- **Short Tagline:** `Physics-based EV corridor planner modeling elevation climb, regenerative braking, cold-weather HVAC penalties, and live charger stall queues on AWS.`
- **AWS Services Leveraged:**
  - `Amazon Location Service (Maps & Places)`: Vector tile streaming, place search auto-complete, place index geocoding.
  - `Amazon Location Service (Routes)`: Multi-point corridor traversal and distance/duration matrix.
  - `AWS Amplify Hosting (Gen 2)`: Automated CI/CD branch deployments with global CloudFront edge acceleration.
  - `Amazon Cognito`: Unauthenticated Identity Pool delivering temporary, scoped IAM permissions for client-side map rendering.
- **The Story:**
  "Millions of EV drivers face extreme range anxiety when traversing mountain passes. Flat 2D maps assume constant battery consumption, leading to stranded drivers on summits like Donner Pass (7,200 ft elevation). EcoRoute bridges this gap by combining Amazon Location Service with topographical elevation calculations and regenerative braking models, buffering 45,000+ EV charging stations directly along travel corridors."
- **Live Demo Link:** `https://main.d1abcdef.amplifyapp.com`
- **GitHub Repository:** Public repo with `README.md`, `DESIGN.md`, `FULL_GUIDE.md`, and 5 submission SVG graphics.

---

## 2. Track B: Clean Energy & Open Geospatial Hackathon
**Submission Window:** November 2026  
**Primary Criteria:** Climate impact, real-world utility, open dataset integration, and algorithmic creativity.

### Form Inputs for Open Geospatial & Climate Innovation
- **Project Title:** `EcoRoute — Predictive EV Topographical Navigation & Grid Load Navigator`
- **Short Tagline:** `Eliminating mountain EV range anxiety and optimizing highway charging corridors using NREL open alternative fuels datasets and real-world elevation physics.`
- **Dataset Leveraged:**
  - `NREL Alternative Fuels Data Center (AFDC)`: 45,000+ national EV charging station coordinates.
  - `Open Charge Map API`: Real-time connector types (CCS, NACS/Tesla, J1772), power output (50–350 kW), and operational stall states.
  - `USGS 3D Elevation Program (3DEP)`: Topographical slope matrices for Sierra Nevada highway corridors.
- **Climate & Decarbonization Impact:**
  - Accurately predicts battery drain on steep ascents ($+0.003\text{ kWh/ft}$) and energy recovery via regenerative braking ($-0.002\text{ kWh/ft}$).
  - Simulates cold-weather HVAC energy draw ($20^\circ\text{F} \to 110^\circ\text{F}$ ambient temperature curve).
  - Calculates real-time carbon offsets: average 180-mile corridor trip avoids **78.6 lbs of CO₂** and saves **4.0 gallons of gasoline**.
- **Algorithmic Craftsmanship:**
  - Turf.js convex hull and line buffering algorithms generate dynamic 5–50 mile corridor envelopes in $<10\text{ ms}$.
  - Real-time stall queue simulation models charging speed differences between $350\text{ kW}$ ultra-fast DC stalls and $50\text{ kW}$ legacy units.

---

## 3. Video Walkthrough & Presentation Scripts (2 Variations)

### Script A: AWS Developer Focus (2 Minutes)
> *"Hello builders! Today we're showcasing EcoRoute, a serverless spatial application built on Amazon Location Service. Watch how sub-second place indexing auto-completes our destination, while MapLibre GL JS renders thousands of clustered stations without GPU drop. Under the hood, AWS Amplify Hosting deploys our optimized 59 kB bundle to global CloudFront edge points, with zero hardcoded API keys thanks to Amazon Cognito Identity Pools."*

### Script B: Clean Energy & Climate Focus (2 Minutes)
> *"Welcome to EcoRoute. Every winter, thousands of electric vehicles struggle over mountain passes because standard GPS systems ignore gravity and temperature. Watch what happens when we select a Rivian R1T or Tesla Model 3 at 20°F ambient temperature: our physics engine immediately recalibrates effective range and plots the exact fast chargers you need before hitting Donner Summit. By modeling elevation gains and regenerative braking descent into Lake Tahoe, EcoRoute turns range anxiety into predictable, zero-emission road trips."*

---

## 4. Verification & Submission Assets Checklist
- [x] **Automated Tests:** 6/6 tests passing (`node test_suite.mjs`).
- [x] **Production Bundle:** Clean Vite build (`dist/` 59 kB entry chunk).
- [x] **Semantic Design System:** Documented in `DESIGN.md`.
- [x] **Full Operator Guide:** Documented in `FULL_GUIDE.md`.
- [x] **Showcase Visuals:** 5 high-resolution SVGs in `assets/submissions/`:
  - `01_main_corridor_map.svg` (Spatial map interface)
  - `02_station_modal_clean_energy.svg` (Double-bezel station modal)
  - `03_elevation_battery_profile.svg` (Elevation curve & regen chart)
  - `04_aws_cloud_architecture.svg` (AWS serverless architecture)
  - `05_driver_manifest_itinerary.svg` (Turn-by-turn charging manifest)

