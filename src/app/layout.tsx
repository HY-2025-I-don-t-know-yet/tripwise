"use client";

import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/themeProvider";
import { ThemeToggle } from "@/components/themeToggle";
import { Sidebar } from "@/components/sidebar";
import { useRouteStore } from "@/stores/routeStore";
import { planOptimalRoute } from "@/lib/planOptimalRoute";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const startCoords = useRouteStore((state) => state.startCoords);
  const endCoords = useRouteStore((state) => state.endCoords);
  const setRoutePath = useRouteStore((state) => state.setRoutePath);

  const handlePlanRoute = () => {
    if (startCoords && endCoords) {
      planOptimalRoute([startCoords, endCoords]).then((geojson) => {
        if (geojson) {
          setRoutePath(geojson.geometry.coordinates);
        }
      });
    }
  }

  return (
    // legal hack as it is only caused by theme change
    <html lang="en" suppressHydrationWarning>
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
