import { Coords } from "@/types/coords";
import polyline from "@mapbox/polyline"

const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving"

export interface RouteGeoJSON {
    type: "Feature"
    geometry: {
        type: "LineString"
        coordinates: [number, number][] // [lng, lat]
    }
}

export async function planOptimalRoute(coords: Coords[], dangerousPolygons?: { geometry: { coordinates: [number, number][][] } }[]): Promise<RouteGeoJSON | null> {
    var parts: string[] = []
    coords.forEach(coord => {
        parts.push(`${coord.lon},${coord.lat}`)
    })
    const coordinates = parts.join(";")

    try {
        const url = `${OSRM_API_URL}/${coordinates}?overview=full&geometries=polyline`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Error fetching route: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.routes?.length) {
            console.warn("No route found")
            return null
        }

        const encodedPolyline = data.routes[0].geometry
        const decodedPolyline: [number, number][] = polyline.decode(encodedPolyline)

        const routeCoords: [number, number][] = decodedPolyline.map(([lat, lng]: [number, number]) => [lng, lat]);

        if (dangerousPolygons) {
            for (const point of routeCoords) {
                for (const feature of dangerousPolygons) {
                    const x = point[0], y = point[1];
                    const polygon = feature.geometry.coordinates[0];
                    let isInside = false;
                    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                        const xi = polygon[i][0], yi = polygon[i][1];
                        const xj = polygon[j][0], yj = polygon[j][1];
                        const intersect = ((yi > y) != (yj > y))
                            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if (intersect) isInside = !isInside;
                    }
                    if (isInside) {
                        console.warn("Route intersects with a dangerous area", feature);
                        // Here you could implement logic to handle the intersection,
                        // for now, we just warn.
                    }
                }
            }
        }


        const geojson: RouteGeoJSON = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: routeCoords,
            },
        }

        return geojson
    } catch (err) {
        console.error("Error fetching route:", err)
        return null
    }
}
