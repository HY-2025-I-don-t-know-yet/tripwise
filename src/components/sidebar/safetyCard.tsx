"use client"

import { Slider } from "../ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

import Image from 'next/image';
import Level1Icon from "../../../public/level1.svg"
import Level1BwIcon from "../../../public/level1-bw.svg"
import Level2Icon from "../../../public/level2.svg"
import Level2BwIcon from "../../../public/level2-bw.svg"
import Level3Icon from "../../../public/level3.svg"
import Level3BwIcon from "../../../public/level3-bw.svg"
import Level4Icon from "../../../public/level4.svg"
import Level4BwIcon from "../../../public/level4-bw.svg"

const DANGER_LEVELS = {
    MINOR: {
        threshold: 25,
        color: "bg-yellow-300",
        label: "Minor",
        text: "You will be notified of minor disturbances or higher (vandalism, graffiti)."
    },
    MODERATE: {
        threshold: 50,
        color: "bg-yellow-500",
        label: "Moderate",
        text: "You will be notified of moderate disturbances or higher (reckless driving, noise)."
    },
    SIGNIFICANT: {
        threshold: 75,
        color: "bg-red-300",
        label: "Significant",
        text: "You will be notified of significant disturbances or higher (protests, major disruptions)."
    },
    CRITICAL: {
        threshold: 100,
        color: "bg-red-500",
        label: "Critical",
        text: "You will be notified of critical disturbances (life-threatening risks, riots, violent crime)."
    },
} as const


export function SafetyCard() {
    const [dangerLevel, setDangerLevel] = useState<number>(0)

    // Invert slider value so left=highest, right=lowest
    const invertedValue = 100 - dangerLevel

    const getCurrentLevel = () => {
        if (invertedValue <= DANGER_LEVELS.MINOR.threshold) return DANGER_LEVELS.MINOR
        if (invertedValue <= DANGER_LEVELS.MODERATE.threshold) return DANGER_LEVELS.MODERATE
        if (invertedValue <= DANGER_LEVELS.SIGNIFICANT.threshold) return DANGER_LEVELS.SIGNIFICANT
        return DANGER_LEVELS.CRITICAL
    }

    const currentLevel = getCurrentLevel()

    const levels = [DANGER_LEVELS.CRITICAL, DANGER_LEVELS.SIGNIFICANT, DANGER_LEVELS.MODERATE, DANGER_LEVELS.MINOR]
    const icons = [Level4Icon, Level3Icon, Level2Icon, Level1Icon]
    const iconsBw = [Level4BwIcon, Level3BwIcon, Level2BwIcon, Level1BwIcon]

    return (
        <Card className="w-full bg-muted/20 rounded-lg">
            <CardHeader >
                <CardTitle className="text-lg font-semibold text-foreground">
                    Risk Management
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Slider */}
                <Slider
                    value={[dangerLevel]}
                    onValueChange={(value) => setDangerLevel(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                    aria-label="Danger level"
                />

                {/* Icons row */}
                <div className="flex justify-between mt-2">
                    {levels.map((level, i) => {
                        const isBelowThreshold = invertedValue < level.threshold

                        return (
                            <div key={level.label} className="flex flex-col items-center gap-1">
                                <Image
                                    alt={level.label}
                                    src={!isBelowThreshold ? iconsBw[i] : icons[i]}
                                    className={`h-6 w-6 ${isBelowThreshold ? level.color.replace("bg-", "text-") : "text-muted-foreground"}`}
                                />
                                <span className="text-xs text-muted-foreground">{level.label}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Danger description box */}
                <div className={`p-3 rounded-md bg-opacity-20 border-l-4 ${currentLevel.color}`}>
                    <p className="text-sm text-black font-medium">{currentLevel.text}</p>
                </div>
            </CardContent>
        </Card>
    )
}
