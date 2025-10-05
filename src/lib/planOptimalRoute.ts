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

export async function planOptimalRoute(coords: Coords[]): Promise<RouteGeoJSON | null> {
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

        const geojson: RouteGeoJSON = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: decodedPolyline.map(([lat, lng]: [number, number]) => [lng, lat]),
            },
        }

        return geojson
    } catch (err) {
        console.error("Error fetching route:", err)
        return null
    }
}