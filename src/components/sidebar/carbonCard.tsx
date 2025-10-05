import { useRouteStore } from "@/stores/routeStore"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { Separator } from "../ui/separator"

// Average carbon footprint per meter (in kg CO₂e/m)
const FOOTPRINTS_PER_M = {
    car: 0.000192,        // ≈ 192 g/km
    bus: 0.000089,        // ≈ 89 g/km
    train: 0.000041,      // ≈ 41 g/km
    bike: 0.000007,       // ≈ 7 g/km (mostly food-based energy)
    walk: 0.000005,       // ≈ 5 g/km
}

export function CarbonCard() {
    const vehicleType = useRouteStore((state) => state.vehicleType)
    const routePath = useRouteStore((state) => state.routePath)

    // --- Compute total route length in meters ---
    // routePath expected as array of coordinates: [{ lat, lng }, ...]
    let totalDistance = 0
    if (routePath && routePath.length > 1) {
        for (let i = 1; i < routePath.length; i++) {
            const a = routePath[i - 1]
            const b = routePath[i]
            const R = 6371000 // Earth radius (m)
            const dLat = ((b[0] - a[0]) * Math.PI) / 180
            const dLng = ((b[1] - a[1]) * Math.PI) / 180
            const lat1 = (a[0] * Math.PI) / 180
            const lat2 = (b[0] * Math.PI) / 180
            const h =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
            totalDistance += 2 * R * Math.asin(Math.sqrt(h))
        }
    }

    // --- Compute footprint ---
    const avgPerMeter = FOOTPRINTS_PER_M[vehicleType as keyof typeof FOOTPRINTS_PER_M] || 0.000192
    const footprintKg = (totalDistance * avgPerMeter).toFixed(2) // total kg CO₂e

    // --- Reference average for comparison ---
    const avgFootprintKg = 30
    const reductionPercent = ((1 - Number(footprintKg) / avgFootprintKg) * 100).toFixed(1)

    return (
        <Card className="bg-muted/20 rounded-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                    Szacowany Ślad Węglowy
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Emisja spalin</p>
                    <p className="text-base font-medium">{footprintKg} kg CO₂e</p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                        Przewidywany vs. Średni ślad węglowy
                    </p>
                    <Progress value={Number(reductionPercent)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                        {reductionPercent}% poniżej średniej
                    </p>
                </div>

                {routePath && routePath.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                        Długość trasy: {(totalDistance / 1000).toFixed(2)} km ({vehicleType})
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
