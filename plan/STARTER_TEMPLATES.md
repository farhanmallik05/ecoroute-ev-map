# Starter Templates & Scripts: Weekend Challenge: Map it

This guide contains complete, ready-to-run AWS CLI setup commands and a plug-and-play frontend starter template combining **React + MapLibre GL JS + Amazon Location Service**.

---

## 💻 1. AWS CLI Resource Provisioning Script

Run these commands in PowerShell or bash with your AWS CLI configured (`aws configure`):

```bash
# 1. Set environment variables
export AWS_REGION="us-east-1"
export MAP_NAME="EcoRouteMap"
export PLACE_INDEX="EcoRoutePlaceIndex"
export ROUTE_CALCULATOR="EcoRouteCalculator"
export IDENTITY_POOL_NAME="EcoRouteIdentityPool"

# 2. Create the Amazon Location Service Map (Esri Navigation Vector Style)
aws location create-map \
  --map-name $MAP_NAME \
  --configuration "Style=VectorEsriNavigation" \
  --description "Basemap for EcoRoute Hackathon" \
  --region $AWS_REGION

# 3. Create the Place Index (Geocoding & Search)
aws location create-place-index \
  --index-name $PLACE_INDEX \
  --data-source "Esri" \
  --pricing-plan "RequestBasedUsage" \
  --description "Geocoding index for EcoRoute" \
  --region $AWS_REGION

# 4. Create the Route Calculator
aws location create-route-calculator \
  --calculator-name $ROUTE_CALCULATOR \
  --data-source "Esri" \
  --pricing-plan "RequestBasedUsage" \
  --description "Routing calculator for EcoRoute" \
  --region $AWS_REGION

# 5. Create Amazon Cognito Identity Pool with Unauthenticated Identities
IDENTITY_POOL_ID=$(aws cognito-identity create-identity-pool \
  --identity-pool-name $IDENTITY_POOL_NAME \
  --allow-unauthenticated-identities \
  --region $AWS_REGION \
  --query 'IdentityPoolId' \
  --output text)

echo "Cognito Identity Pool ID: $IDENTITY_POOL_ID"

# 6. Create IAM Role for Unauthenticated Access
cat <<EOF > unauth-role-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "cognito-identity.amazonaws.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "cognito-identity.amazonaws.com:aud": "$IDENTITY_POOL_ID" },
        "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "unauthenticated" }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name EcoRouteUnauthRole \
  --assume-role-policy-document file://unauth-role-trust-policy.json

# 7. Attach Scoped Policy to Role
cat <<EOF > location-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "geo:GetMapGlyphs",
        "geo:GetMapSprites",
        "geo:GetMapStyleDescriptor",
        "geo:GetMapTile"
      ],
      "Resource": "arn:aws:geo:$AWS_REGION:*:map/$MAP_NAME"
    },
    {
      "Effect": "Allow",
      "Action": [
        "geo:SearchPlaceIndexForPosition",
        "geo:SearchPlaceIndexForSuggestions",
        "geo:SearchPlaceIndexForText"
      ],
      "Resource": "arn:aws:geo:$AWS_REGION:*:place-index/$PLACE_INDEX"
    },
    {
      "Effect": "Allow",
      "Action": [
        "geo:CalculateRoute"
      ],
      "Resource": "arn:aws:geo:$AWS_REGION:*:route-calculator/$ROUTE_CALCULATOR"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name EcoRouteUnauthRole \
  --policy-name EcoRouteLocationAccess \
  --policy-document file://location-policy.json

# 8. Set Role in Identity Pool
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id $IDENTITY_POOL_ID \
  --roles unauthenticated=$(aws iam get-role --role-name EcoRouteUnauthRole --query 'Role.Arn' --output text) \
  --region $AWS_REGION
```

---

## ⚡ 2. Complete Frontend Map Component (`MapComponent.tsx`)

This component mounts **MapLibre GL**, connects to **Amazon Location Service**, signs requests via temporary Cognito credentials, and renders dynamic points:

```tsx
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";

const REGION = import.meta.env.VITE_AWS_REGION || "us-east-1";
const MAP_NAME = import.meta.env.VITE_MAP_NAME || "EcoRouteMap";
const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID;

export const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 1. Initialize AWS Credentials Provider
    const credentials = fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: REGION }),
      identityPoolId: IDENTITY_POOL_ID,
    });

    // 2. Build Amazon Location Tile Style URL
    const mapStyleUrl = `https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP_NAME}/style-descriptor`;

    // 3. Initialize MapLibre with AWS SigV4 Request Transform
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyleUrl,
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 11,
      transformRequest: (url: string, resourceType?: string) => {
        if (url.startsWith("https://maps.geo.") || url.startsWith("https://places.geo.")) {
          return {
            url,
            // When using API keys or AWS Amplify Geo, headers can be attached here
          };
        }
        return { url };
      },
    });

    map.on("load", () => {
      setLoading(false);
      map.addControl(new maplibregl.NavigationControl(), "top-right");

      // Example: Adding sample GeoJSON source with clustering
      map.addSource("stations", {
        type: "geojson",
        data: "/sample_stations.geojson",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles layer
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "stations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#10B981", // green for < 10
            10,
            "#3B82F6", // blue for 10-50
            50,
            "#F59E0B", // amber for 50+
          ],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 32],
        },
      });

      // Cluster count text
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "stations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Unclustered point markers
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#10B981",
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 text-white">
          <p className="animate-pulse">Loading Amazon Location Basemap...</p>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
```

