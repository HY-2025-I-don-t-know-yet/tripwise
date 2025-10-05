"use client";

import "./globals.css";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/themeProvider";
import { ThemeToggle } from "@/components/themeToggle";
import { Sidebar } from "@/components/sidebar";
import { useRouteStore } from "@/stores/routeStore";
import { planOptimalRoute } from "@/lib/planOptimalRoute";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSafetyStore } from "@/stores/safetyStore";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const startCoords = useRouteStore((state) => state.startCoords);
  const endCoords = useRouteStore((state) => state.endCoords);
  const setRoutePath = useRouteStore((state) => state.setRoutePath);
  const dangerLevel = useSafetyStore((state) => state.dangerLevel);
  const [aggregatedData, setAggregatedData] = useState<any | null>(null);

  useEffect(() => {
    async function loadAggregatedData() {
      try {
        const res = await fetch("/blobs/data_aggregated.json");
        const geojson = await res.json();
        setAggregatedData(geojson);
      } catch (err) {
        console.error("Failed to load aggregated data:", err);
      }
    }
    loadAggregatedData();
  }, []);


  const handlePlanRoute = () => {
    if (startCoords && endCoords && aggregatedData) {
      const latBuffer = 50 / 111.32; // 50km in degrees latitude
      const avgLatRad = ((startCoords.lat + endCoords.lat) / 2) * (Math.PI / 180);
      const lonBuffer = 50 / (111.32 * Math.cos(avgLatRad)); // 50km in degrees longitude at avg latitude

      const minLat = Math.min(startCoords.lat, endCoords.lat) - latBuffer;
      const maxLat = Math.max(startCoords.lat, endCoords.lat) + latBuffer;
      const minLon = Math.min(startCoords.lon, endCoords.lon) - lonBuffer;
      const maxLon = Math.max(startCoords.lon, endCoords.lon) + lonBuffer;

      const dangerMapping = {
        0: 8, 1: 1, 2: 3, 3: 7, 4: 7, 5: 3, 6: 2, 7: 1, 8: 1, 9: 10, 10: 8,
        11: 4, 12: 9, 13: 1, 14: 2, 15: 7, 16: 8, 17: 4, 18: 5, 19: 2, 20: 9
      };

      const invertedValue = 100 - dangerLevel;
      const dangerThreshold = Math.floor(invertedValue / 10) + 1;

      const visibleNameIds = Object.entries(dangerMapping)
        .filter(([nameId, danger]) => danger >= dangerThreshold)
        .map(([nameId]) => parseInt(nameId, 10));

      const filteredFeatures = aggregatedData.features
        .filter((feature: any) => {
          if (!visibleNameIds.includes(feature.properties.name_id)) {
            return false;
          }

          const polygon = feature.geometry.coordinates[0];
          // Check if any vertex of the polygon is inside the bounding box
          const isInside = polygon.some((point: [number, number]) =>
            point[1] >= minLat && point[1] <= maxLat &&
            point[0] >= minLon && point[0] <= maxLon
          );
          return isInside;
        });

      const dangerousGeometries = filteredFeatures.map((f: any) => f.geometry);

      planOptimalRoute([startCoords, endCoords], dangerousGeometries).then((geojson) => {
        if (geojson) {
          setRoutePath(geojson.geometry.coordinates);
        }
      });
    }
  }

  return (
    // legal hack as it is only caused by theme change
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <div className="absolute top-0 left-0">
              <div className="flex flex-row align-end items-end">
                <Sidebar />
                <Button className="m-4 rounded-full p-6 w-30 bg-lime-600 hover:bg-lime-500 hover:border-black border-transparent border-2" onClick={handlePlanRoute}>Podróżuj!<ArrowRight /></Button>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
