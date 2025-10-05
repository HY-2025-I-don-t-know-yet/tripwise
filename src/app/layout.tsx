"use client";

import "./globals.css";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/themeProvider";
import { ThemeToggle } from "@/components/themeToggle";
import { Sidebar } from "@/components/sidebar";
import { useRouteStore } from "@/stores/routeStore";
import { planOptimalRoute, planRoute } from "@/lib/planRoute";
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
  const setDangerousPolygonsForDisplay = useRouteStore((state) => state.setDangerousPolygonsForDisplay);
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
    if (startCoords && endCoords) {
      planRoute([startCoords, endCoords]).then((geojson) => {
        if (geojson) {
          setRoutePath(geojson.geometry.coordinates);
        }
      })
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
