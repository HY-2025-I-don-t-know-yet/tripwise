import { Coords } from "@/types/coords";
import polyline from "@mapbox/polyline";

const VALHALLA_API_URL = "/api/routing";

export interface RouteGeoJSON {
    type: "Feature";
    geometry: {
        type: "LineString";
        coordinates: [number, number][]; // [lng, lat]
    };
}

export async function planRouteWithExclusions(
    coords: Coords[],
    dangerousGeometries?: { type: string; coordinates: [number, number][][][]; }[]
): Promise<RouteGeoJSON | null> {
    const locations = coords.map(coord => ({
        lon: coord.lon,
        lat: coord.lat,
    }));

    const requestBody: any = {
        locations,
        costing: "auto",
        alternates: 1,
        costing_options: {
            auto: {}
        }
    };

    if (dangerousGeometries) {
        const polygons = dangerousGeometries
            .map(g => g.coordinates[0][0]) // Extract the exterior ring
            .filter(p =>
                p && p.length > 2 && p.every(c =>
                    c && c.length === 2 && !isNaN(parseFloat(c[0] as any)) && !isNaN(parseFloat(c[1] as any))
                )
            )
            .map(p => {
                const cleanedPolygon = p.map(c => [
                    parseFloat(Number(c[0]).toFixed(6)),
                    parseFloat(Number(c[1]).toFixed(6))
                ]);

                // Ensure the polygon is closed
                const firstPoint = cleanedPolygon[0];
                const lastPoint = cleanedPolygon[cleanedPolygon.length - 1];
                if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                    cleanedPolygon.push(firstPoint);
                }
                return cleanedPolygon;
            });

        if (polygons.length > 0) {
            requestBody.exclude_polygons = polygons;
        }
    }

    try {
        const response = await fetch(VALHALLA_API_URL, {
            method: "POST",
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Error fetching route: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.trip?.legs?.length) {
            console.warn("No route found");
            return null;
        }

        const encodedPolyline = data.trip.legs[0].shape;
        const decodedPolyline: [number, number][] = polyline.decode(encodedPolyline, 6).map((c: [number, number]) => [c[1], c[0]]);

        const geojson: RouteGeoJSON = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: decodedPolyline,
            },
        };

        return geojson;
    } catch (err) {
        console.error("Error fetching route:", err);
        return null;
    }
}
