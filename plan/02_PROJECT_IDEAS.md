# 02 — Project Ideas: Weekend Challenge: Map it

This guide presents 4 carefully engineered project ideas tailored specifically to excel under the AWS Builder Center evaluation rubric. Each concept balances **high visual impact**, **deep use of AWS Location Services**, and **feasible 72-hour execution**.

---

## 🏆 Project Comparison Matrix

| Project Concept | Theme & Domain | AWS Services Leveraged | Dataset Source | Hackathon Appeal | Feasibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. EcoRoute: Clean Energy & EV Grid Navigator** *(Recommended Winner)* | Clean Energy / Sustainability / Mobility | Amazon Location Service (Maps, Places, Routes), Lambda, S3, Cognito | NREL Alternative Fuels Data Center & Open Charge Map API | ⭐⭐⭐⭐⭐ Highest practical & visual appeal | High (48 hrs) |
| **2. QuakeGuard: Crisis Relief & Live Seismic Dashboard** | Disaster Response / Humanitarian | Amazon Location Service (Maps, Geofences, Places), EventBridge, SNS | USGS Real-time Earthquake GeoJSON Feed & OpenStreetMap Shelters | ⭐⭐⭐⭐⭐ High emotional & civic impact | Medium (40 hrs) |
| **3. UrbanCanopy: Heat Island & Tree Equity Explorer** | Climate / Urban Planning | Amazon Location Service, Athena, S3, AWS Open Data Registry | Landsat-8 Surface Temp + City Forestry Open Data (NYC/LA/Chicago) | ⭐⭐⭐⭐ Visually stunning heatmaps | Medium (36 hrs) |
| **4. FleetPulse: Real-Time Logistics & Geofence Tracker** | Supply Chain / Smart Logistics | Amazon Location Service (Trackers, Geofences, Routes), IoT Core, DynamoDB | Simulated GPS Telemetry + Port/Warehouse GeoJSON boundaries | ⭐⭐⭐⭐ Shows enterprise AWS prowess | Medium-High (50 hrs) |

---

## 🌟 Deep Dive on Project 1 (Recommended): EcoRoute — EV & Clean Energy Navigator

### The Problem
EV drivers face "range anxiety" not just from a lack of chargers, but from unpredictable station availability, charger speeds, and topography. Standard map apps often route along the shortest path without accounting for elevation climbs or proximity to renewable-powered fast chargers.

### The Solution
**EcoRoute** is an interactive web dashboard that combines:
1. **Dynamic EV Charger Mapping**: Clustered interactive pins showing charger wattage, connector types (CCS, NACS, CHAdeMO), and real-time operational status.
2. **Energy-Optimized Routing**: Calculates driving routes via Amazon Location Service Route Calculator, calculating elevation profiles and inserting optimal charging pitstops.
3. **Renewable Energy Heatmap**: Visual overlay showing regional electric grid clean-energy percentages (solar/wind hours).

### Key Features
- **Map View:** High-performance vector tiles rendered with MapLibre GL JS using Amazon Location Service styled vector basemap (e.g. *Esri Navigation* or *HERE Explore*).
- **Smart Charger Filtering:** Filter by DC Fast (>150kW), Level 2, Free vs. Paid, and open now.
- **Trip Planner:** Choose start and destination; the app calculates the route using Amazon Location Service, marks waypoints, and dynamically identifies chargers along the corridor within a 5-mile buffer.
- **Range Reach Isochrone / Polygon:** Visualizes how far an EV can travel on 20%, 50%, or 80% battery capacity.

### Data Sources
- **National Renewable Energy Laboratory (NREL) Developer API**: Real-time US/Canada alternative fuel station dataset.
- **Open Charge Map API**: Global EV station crowdsourced and verified database.
- **USGS 3D Elevation Program (3DEP)**: Elevation data for gradient calculation.

---

## ⚡ Deep Dive on Project 2: QuakeGuard — Global Real-Time Seismic & Relief Hub

### The Problem
During natural disasters, communities and first responders need immediate, unified situational awareness: Where was the epicenter? What is the radius of severe shaking? Where are designated emergency shelters and hospitals, and are the access roads open?

### The Solution
**QuakeGuard** ingests live seismic activity directly from the USGS real-time GeoJSON API, renders earthquake magnitude markers with proportional radius and depth coloration, and connects directly to emergency resource locations.

### Key Features
- **Live Shake Intensity Circles:** Dynamic circles indicating Modified Mercalli Intensity scale (MMI).
- **Shelter & Resource Locator:** Uses Amazon Location Service `SearchPlaceIndexForPosition` to locate the nearest 5 hospitals and emergency shelters to any clicked point.
- **Evacuation Route Generator:** Computes walking or driving escape routes avoiding high-hazard zones.
- **Virtual Geofence Alerts:** Simulates a virtual perimeter around metropolitan zones; triggers simulated AWS SNS alert notifications whenever an earthquake of M > 4.5 occurs within the geofence.

---

## 🌿 Deep Dive on Project 3: UrbanCanopy — Satellite Heat Islands & Green Canopy

### The Problem
Urban areas with sparse greenery can experience summer temperatures up to 10°F to 15°F higher than surrounding rural areas ("urban heat island effect"). Urban planners and residents need clear spatial visibility to prioritize tree planting and cool roof investments.

### The Solution
An interactive environmental equity dashboard that layers land surface temperature satellite rasters over open city tree census datasets, highlighting the exact neighborhood blocks most in need of shade.

### Key Features
- **Split-Screen Slider:** Compare Satellite Surface Heat vs. Tree Canopy density block-by-block.
- **Block-Level Equity Score:** Users click any neighborhood to view tree canopy coverage %, estimated summer temperature delta, and population vulnerability index.
- **Search by Address:** Uses Amazon Location Service Places to search any address and evaluate its neighborhood climate score.

---

## 🚚 Deep Dive on Project 4: FleetPulse — Real-Time IoT Logistics & Geofencing

### The Problem
Logistics and field service companies need to track fleets in real time, automatically detect when delivery vans arrive at distribution hubs, and compute accurate ETAs based on real traffic conditions.

### The Solution
A full-stack logistics monitoring portal demonstrating the complete suite of Amazon Location Service: **Trackers**, **Geofences**, **Routes**, and **Maps**.

### Key Features
- **Animated Fleet Telemetry:** Smoothly renders moving delivery vehicles along predetermined delivery routes.
- **Automated Geofence Events:** Triggers enter/exit events as vehicles cross warehouse perimeters.
- **Traffic-Aware ETA Matrix:** Computes real-time driving duration to destinations using Amazon Location Service Route Calculator.

---

## 💡 Selection Recommendation

> **Recommendation for the Winning Submission:**
> 
> Choose **Project 1: EcoRoute**.
> - It combines **all three core Amazon Location capabilities** (Maps for visual tiles, Places for searching stations/addresses, Routes for calculating multi-stop EV itineraries).
> - It solves a relatable, modern problem that judges understand instantly.
> - Open EV APIs (NREL & Open Charge Map) are free, reliable, and require zero scraping.
> - The UI looks gorgeous on demo videos with dark mode vector maps, glowing charger pins, and clean gradient routes.

