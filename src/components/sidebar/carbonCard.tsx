import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { Separator } from "../ui/separator"

export function CarbonCard() {
    const footprintKg = 24.5        // example computed footprint
    const avgFootprintKg = 30       // average trip reference
    const reductionPercent = ((1 - footprintKg / avgFootprintKg) * 100).toFixed(1)

    return (
        <Card className="bg-muted/20 rounded-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                    Carbon Footprint Summary
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Estimated Emissions</p>
                    <p className="text-base font-medium">{footprintKg} kg CO₂e</p>
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Average Trip (same distance)</p>
                    <p className="text-base font-medium">{avgFootprintKg} kg CO₂e</p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                        Reduction vs. average trip
                    </p>
                    <Progress value={Number(reductionPercent)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                        {reductionPercent}% lower emissions
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}