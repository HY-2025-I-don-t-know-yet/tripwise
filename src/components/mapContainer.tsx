"use client"

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from "next-themes";

export function MapContainer() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);

    const { theme } = useTheme();
    const lightStyle = "https://api.maptiler.com/maps/dataviz/style.json?key=kqT70GQUj2ATs93Kxis5";
    const darkStyle = "https://api.maptiler.com/maps/toner-v2/style.json?key=kqT70GQUj2ATs93Kxis5";

    useEffect(() => {
        if (!mapRef.current) return;
        if (!mapInstance.current) {
            mapInstance.current = new maplibregl.Map({
                container: mapRef.current,
                style: theme === "dark" ? darkStyle : lightStyle,
                center: [19.9445, 50.0540],
                zoom: 13,
            });
        } else {
            mapInstance.current.setStyle(theme === "dark" ? darkStyle : lightStyle);
        }

        mapInstance.current.addControl(new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true
        }), 'bottom-right');

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        }
    }, [theme]);

    return <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />
}