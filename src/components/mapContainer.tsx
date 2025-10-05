"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
    const lightStyle =
        "https://api.maptiler.com/maps/dataviz/style.json?key=kqT70GQUj2ATs93Kxis5";
    const darkStyle =
        "https://api.maptiler.com/maps/toner-v2/style.json?key=kqT70GQUj2ATs93Kxis5";

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = new maplibregl.Map({
                container: mapRef.current,
                style: theme === "dark" ? darkStyle : lightStyle,
                center: [19.9445, 50.054],
                zoom: 13,
            });

            mapInstance.current.addControl(
                new maplibregl.NavigationControl({
                    showCompass: true,
                    showZoom: true,
                }),
                "bottom-right"
            );
        } else {
            mapInstance.current.setStyle(theme === "dark" ? darkStyle : lightStyle);
        }

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, [theme]);

    // Add markers
    useEffect(() => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;

        // Start marker
        if (startCoords) {
            if (!startMarker.current) {
                startMarker.current = new maplibregl.Marker({ color: "green" })
                    .setLngLat([startCoords.lon, startCoords.lat])
                    .addTo(map);
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
                endMarker.current = new maplibregl.Marker({ color: "red" })
                    .setLngLat([endCoords.lon, endCoords.lat])
                    .addTo(map);
            } else {
                endMarker.current.setLngLat([endCoords.lon, endCoords.lat]);
            }
        } else {
            endMarker.current?.remove();
            endMarker.current = null;
        }
    }, [startCoords, endCoords]);

    // Draw route
    useEffect(() => {
        if (!mapInstance.current || !routePath || routePath.length === 0) return;

        const map = mapInstance.current;
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
    }, [routePath]);

    // Draw splats with flat-Earth distance approximation
    useEffect(() => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;

        async function loadSplats() {
            try {
                const res = await fetch("/blobs/data_minimized.json");
                const json = await res.json();

                // Rough conversion: 1 degree latitude ≈ 111_000 m
                // and 1 degree longitude ≈ 111_000 * cos(latitude) m
                const METERS_PER_DEG_LAT = 111_000;

                function circleToPolygonFlat(
                    lon: number,
                    lat: number,
                    radiusMeters: number,
                    points = 32
                ) {
                    const coords: [number, number][] = [];
                    const metersPerDegLon =
                        METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
                    const dLat = radiusMeters / METERS_PER_DEG_LAT;
                    const dLon = radiusMeters / metersPerDegLon;

                    for (let i = 0; i < points; i++) {
                        const angle = (i / points) * Math.PI * 2;
                        coords.push([
                            lon + Math.cos(angle) * dLon,
                            lat + Math.sin(angle) * dLat,
                        ]);
                    }
                    coords.push(coords[0]);
                    return coords;
                }

                const features = json.map((item: any) => ({
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            circleToPolygonFlat(item.b, item.a, item.c),
                        ],
                    },
                    properties: {
                        radius: item.c,
                        intensity: item.d ?? 1,
                    },
                }));

                const geojson = {
                    type: "FeatureCollection",
                    features,
                };

                if (map.getLayer("splats")) map.removeLayer("splats");
                if (map.getSource("splats")) map.removeSource("splats");

                map.addSource("splats", {
                    type: "geojson",
                    data: geojson as any,
                });

                map.addLayer({
                    id: "splats",
                    type: "fill",
                    source: "splats",
                    paint: {
                        "fill-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "radius"],
                            0,
                            "#4CAF50",
                            500,
                            "#FF9800",
                            1000,
                            "#F44336",
                        ],
                        "fill-opacity": 0.4,
                    },
                });
            } catch (err) {
                console.error("Failed to load splats:", err);
            }
        }

        loadSplats();
    }, []);

    return <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />;
}
