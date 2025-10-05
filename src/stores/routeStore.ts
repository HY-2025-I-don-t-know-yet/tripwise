import { create } from "zustand"
import { Coords } from "@/types/coords"

interface RouteStore {
    startCoords: Coords | null
    endCoords: Coords | null
    vehicleType: string,
    routePath: [number, number][] | null
    dangerousPolygonsForDisplay: any[] | null
    setStartCoords: (coords: Coords | null) => void
    setEndCoords: (coords: Coords | null) => void
    setVehicleType: (type: string) => void
    setRoutePath: (path: [number, number][] | null) => void
    setDangerousPolygonsForDisplay: (polygons: any[] | null) => void
}

export const useRouteStore = create<RouteStore>((set: any) => ({
    startCoords: null,
    endCoords: null,
    vehicleType: "car",
    routePath: null,
    dangerousPolygonsForDisplay: null,
    setStartCoords: (coords: Coords | null) => set({ startCoords: coords }),
    setEndCoords: (coords: Coords | null) => set({ endCoords: coords }),
    setVehicleType: (type: string) => set({ vehicleType: type }),
    setRoutePath: (path: [number, number][] | null) => set({ routePath: path }),
    setDangerousPolygonsForDisplay: (polygons: any[] | null) => set({ dangerousPolygonsForDisplay: polygons }),
}))
