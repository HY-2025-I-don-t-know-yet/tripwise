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

export async function planOptimalRoute(
    coords: Coords[],
    dangerousGeometries?: { type: string; coordinates: [number, number][][]; }[]
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
        requestBody.exclude_polygons = dangerousGeometries.map(g => g.coordinates[0]);
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
