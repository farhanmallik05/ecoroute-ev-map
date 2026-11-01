# 06 — Submission & Demo Guide: Weekend Challenge: Map it

This guide provides battle-tested templates, video walkthrough scripts, and submission forms to maximize judging scores on the AWS Builder Center.

---

## 🎬 3-Minute Video Demo Script

Judges typically review dozens of entries in quick succession. A punchy, high-energy, well-structured demo under 3 minutes wins over a meandering 10-minute screencast every time.

```
⏱️ 0:00 - 0:30 | The Hook & Problem Statement
"Hello builders! Millions of drivers are switching to electric vehicles, but long-distance road trips still cause severe range anxiety. Drivers don't just need a map—they need spatial intelligence. 
Introducing EcoRoute: an interactive EV grid navigator built on Amazon Location Service and open clean energy datasets."

⏱️ 0:30 - 1:00 | The Dataset & Spatial Discovery
"For our dataset, we ingested over 45,000 alternative fueling stations from the National Renewable Energy Laboratory and Open Charge Map. 
Notice how our map uses MapLibre GL to cluster thousands of chargers smoothly at 60 frames per second. As we zoom into the Bay Area corridor, clusters expand into individual high-speed DC Fast chargers, with live power wattage and connector availability."

⏱️ 1:00 - 1:50 | The AWS Mapping & Routing Workflow (Live Action)
"Now watch the core AWS workflow:
1. I type our destination, 'Lake Tahoe', into the search bar. Amazon Location Service Place Index auto-completes the address with sub-second latency.
2. When I click 'Calculate EcoRoute', Amazon Location Service Route Calculator analyzes road geometry, elevation, and turns to plot our optimal route.
3. Our application automatically generates a 5-mile spatial buffer along the route polyline, filtering out irrelevant stations and spotlighting only the fast chargers directly along our path."

⏱️ 1:50 - 2:30 | Cloud Architecture & Security Best Practices
"Under the hood, our application is 100% serverless and production-grade on AWS:
- Maps, Places, and Routes are powered natively by Amazon Location Service.
- Client authentication uses Amazon Cognito Identity Pools with least-privilege unauthenticated IAM policies—no hardcoded secret keys anywhere.
- The entire frontend is deployed with automated CI/CD on AWS Amplify Hosting."

⏱️ 2:30 - 3:00 | Impact & Wrap Up
"EcoRoute demonstrates that complex spatial data becomes effortless when paired with AWS Location Services. Check out our live deployment at our Amplify link, explore the open-source repository on GitHub, and thank you for watching!"
```

---

## 📝 AWS Builder Center Submission Form Checklist

When submitting your project on the AWS Builder Center portal, copy, paste, and adapt these answers:

### 1. Project Title
`EcoRoute — EV Clean Energy Corridor & Route Navigator`

### 2. Short Tagline (Max 150 characters)
`Visualize 45,000+ EV chargers, plan long-distance road trips, and find fast chargers along your route using Amazon Location Service and open energy data.`

### 3. The Dataset Used
- **Dataset Name:** NREL Alternative Fuels Data Center & Open Charge Map API
- **Data Attributes:** Lat/Lon coordinates, station name, street address, connector types (J1772, CCS, NACS), power output (kW), operational status, network operator.
- **Why It Matters:** Visualizing station clusters along highway corridors unlocks confidence for sustainable transit and highlights EV charging deserts.

### 4. AWS Services Leveraged
- **Amazon Location Service (Maps):** Vector tile streaming with Esri Navigation style basemap.
- **Amazon Location Service (Places):** Address geocoding and search-as-you-type autocomplete.
- **Amazon Location Service (Routes):** Turn-by-turn waypoint routing and distance/time matrices.
- **Amazon Cognito:** Identity Pool delivering temporary, scoped credentials to MapLibre GL JS.
- **AWS Amplify Hosting:** Automated Git-based deployment with global CDN acceleration and SSL.

### 5. Links
- **Live Demo URL:** `https://main.<your-app-id>.amplifyapp.com`
- **GitHub Repository URL:** `https://github.com/<your-username>/ecoroute-map-aws`
- **Video Walkthrough URL:** `https://youtu.be/...` or `https://www.loom.com/share/...`

---

## 📋 Pre-Flight Submission Verification Checklist

- [ ] Does the live Amplify URL load without errors in an Incognito window?
- [ ] Are there **zero** AWS secret keys or access tokens exposed in frontend bundle files?
- [ ] Does the Place Search auto-complete return valid coordinates?
- [ ] Does clicking a marker render a clean popup with station details?
- [ ] Does the Route Calculator draw a clean vector line on the map?
- [ ] Is the GitHub repository public and does it contain a clear `README.md` with screenshots?
- [ ] Is the video audio clear, and is the video duration under 3 minutes?

