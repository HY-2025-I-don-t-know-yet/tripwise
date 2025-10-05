"use client"

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from "next-themes";
import { useRouteStore } from "@/stores/routeStore";

export function MapContainer() {
    const startCoords = useRouteStore((state) => state.startCoords);
    const endCoords = useRouteStore((state) => state.endCoords);
    const routePath = useRouteStore((state) => state.routePath);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);
    const startMarker = useRef<maplibregl.Marker | null>(null);
    const endMarker = useRef<maplibregl.Marker | null>(null);

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

            mapInstance.current.addControl(new maplibregl.NavigationControl({
                showCompass: true,
                showZoom: true
            }), 'bottom-right');
        } else {
            mapInstance.current.setStyle(theme === "dark" ? darkStyle : lightStyle);
        }

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        }
    }, [theme]);

    // Add markers if coordinates exist
    useEffect(() => {
        if (!mapInstance.current) return;

        // Start marker
        if (startCoords) {
            if (!startMarker.current) {
                startMarker.current = new maplibregl.Marker({ color: 'green' })
                    .setLngLat([startCoords.lon, startCoords.lat])
                    .addTo(mapInstance.current);
            } else {
                startMarker.current.setLngLat([startCoords.lon, startCoords.lat]);
            }
        } else {
            startMarker.current?.remove();
            startMarker.current = null;
        }

        // End marker
        if (endCoords) {
            if (!endMarker.current) {
                endMarker.current = new maplibregl.Marker({ color: 'red' })
                    .setLngLat([endCoords.lon, endCoords.lat])
                    .addTo(mapInstance.current);
            } else {
                endMarker.current.setLngLat([endCoords.lon, endCoords.lat]);
            }
        } else {
            endMarker.current?.remove();
            endMarker.current = null;
        }

    }, [startCoords, endCoords]);

    useEffect(() => {
        if (!mapInstance.current || !routePath || routePath.length === 0) return;

        const map = mapInstance.current;

        // Remove existing source/layer if present
        if (map.getLayer("route")) map.removeLayer("route");
        if (map.getSource("route")) map.removeSource("route");

        map.addSource("route", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: routePath,
                        },
                    },
                ],
            },
        });

        map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#ff7e5f",
                "line-width": 4,
            },
        });

        const bounds = new maplibregl.LngLatBounds(
            routePath[0] as [number, number],
            routePath[0] as [number, number]
        );

        for (const coord of routePath) {
            bounds.extend(coord as [number, number]);
        }

        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 }
        });
    }, [routePath]);

    return <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />
}
