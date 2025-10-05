"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useRouteStore } from "@/stores/routeStore";
import { useSafetyStore } from "@/stores/safetyStore";

interface GeoJSONData {
    type: "FeatureCollection";
    features: any[];
}

export function MapContainer() {
    const startCoords = useRouteStore((state) => state.startCoords);
    const endCoords = useRouteStore((state) => state.endCoords);
    const routePath = useRouteStore((state) => state.routePath);
    const dangerLevel = useSafetyStore((state) => state.dangerLevel);
    const [aggregatedData, setAggregatedData] = useState<GeoJSONData | null>(null);

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
                zoom: 10,
            });

            mapInstance.current.addControl(
                new maplibregl.NavigationControl({
                    showCompass: true,
                    showZoom: true,
                }),
                "bottom-right"
            );
            console.log(routePath, routePath?.length)
            if (mapInstance.current && routePath && routePath.length > 0) {
                mapInstance.current.on('load', () => {
                    drawRoute(mapInstance.current, routePath)
                });
            };
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

    function drawRoute(map: any, routePath: any) {
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

        const bounds = routePath.reduce(
            (bounds: maplibregl.LngLatBounds, coord: [number, number]) => {
                return bounds.extend(coord);
            },
            new maplibregl.LngLatBounds(routePath[0] as [number, number], routePath[0] as [number, number])
        );

        map.fitBounds(bounds, {
            padding: 50, // Add some padding around the route
            maxZoom: 15,
        });
    }

    // Draw route
    useEffect(() => {
        if (!mapInstance.current || !routePath || routePath.length === 0) return;

        drawRoute(mapInstance.current, routePath)
    }, [routePath]);

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

    // Draw splats with flat-Earth distance approximation
    useEffect(() => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;

        /*
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
        }*/

        //loadSplats();

        async function drawAggregatedData() {
            if (!mapInstance.current || !aggregatedData) return;
            const map = mapInstance.current;

            try {
                const dangerMapping = {
                    0: 8, 1: 1, 2: 3, 3: 7, 4: 7, 5: 3, 6: 2, 7: 1, 8: 1, 9: 10, 10: 8,
                    11: 4, 12: 9, 13: 1, 14: 2, 15: 7, 16: 8, 17: 4, 18: 5, 19: 2, 20: 9
                };

                const invertedValue = 100 - dangerLevel;
                const dangerThreshold = Math.floor(invertedValue / 10) + 1;

                const visibleNameIds = Object.entries(dangerMapping)
                    .filter(([nameId, danger]) => danger >= dangerThreshold)
                    .map(([nameId]) => parseInt(nameId, 10));

                const filteredFeatures = aggregatedData.features.filter((feature: any) =>
                    visibleNameIds.includes(feature.properties.name_id)
                );

                const filteredGeojson = {
                    ...aggregatedData,
                    features: filteredFeatures,
                };

                if (map.getSource("aggregated-polygons")) {
                    map.removeLayer("aggregated-polygons-layer");
                    map.removeSource("aggregated-polygons");
                }

                map.addSource("aggregated-polygons", {
                    type: "geojson",
                    data: filteredGeojson,
                });

                map.addLayer({
                    id: "aggregated-polygons-layer",
                    type: "fill",
                    source: "aggregated-polygons",
                    paint: {
                        "fill-color": [
                            "match",
                            ["get", "name_id"],
                            1, "#FF0000",
                            2, "#00FF00",
                            3, "#0000FF",
                            4, "#FFFF00",
                            5, "#FF00FF",
                            6, "#00FFFF",
                            7, "#800000",
                            8, "#008000",
                            9, "#000080",
                            10, "#808000",
                            "#808080" // Default color
                        ],
                        "fill-opacity": 0.5,
                    },
                });
            } catch (err) {
                console.error("Failed to load aggregated data:", err);
            }
        }

        if (mapInstance.current.isStyleLoaded()) {
            drawAggregatedData();
        } else {
            mapInstance.current.on('load', drawAggregatedData);
        }

    }, [dangerLevel, aggregatedData]);

    return <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />;
}
