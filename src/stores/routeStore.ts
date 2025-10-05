import { create } from "zustand"
import { Coords } from "@/types/coords"

interface RouteStore {
    startCoords: Coords | null
    endCoords: Coords | null
    routePath: [number, number][] | null
    setStartCoords: (coords: Coords | null) => void
    setEndCoords: (coords: Coords | null) => void
    setRoutePath: (path: [number, number][] | null) => void
}

export const useRouteStore = create<RouteStore>((set: any) => ({
    startCoords: null,
    endCoords: null,
    routePath: null,
    setStartCoords: (coords: Coords | null) => set({ startCoords: coords }),
    setEndCoords: (coords: Coords | null) => set({ endCoords: coords }),
    setRoutePath: (path: [number, number][] | null) => set({ routePath: path }),
}))