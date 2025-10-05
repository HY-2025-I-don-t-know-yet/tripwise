"use client"

import { useState } from "react"
import { FigmaInput } from "../figmed/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { StreetResult, completeStreetName } from "../../lib/completeStreatName"
import { useRouteStore } from "@/stores/routeStore"

export function RouteCard() {
    const setStartCoords = useRouteStore((state) => state.setStartCoords)
    const setEndCoords = useRouteStore((state) => state.setEndCoords)

    const [startStreet, setStartStreet] = useState("")
    const [endStreet, setEndStreet] = useState("")
    const [suggestions, setSuggestions] = useState<StreetResult[]>([])
    const [activeField, setActiveField] = useState<"start" | "end" | null>(null)

    const handleSearch = async () => {
        if (!activeField) return;
        const query = activeField === "start" ? startStreet : endStreet;
        if (query) {
            const results = await completeStreetName(query);
            setSuggestions(results);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault(); // prevent form submit
            await handleSearch();
        }
    };

    const handleSelectSuggestion = (result: StreetResult) => {
        if (activeField === "start") {
            setStartStreet(result.display_name)
            setStartCoords({
                lat: result.lat,
                lon: result.lon
            })
        }
        if (activeField === "end") {
            setEndStreet(result.display_name)
            setEndCoords({
                lat: result.lat,
                lon: result.lon
            })
        }
        setSuggestions([])
    }

    return (
        <form className="space-y-2.5 p-3 bg-muted/20 rounded-lg w-full">
            <h2 className="text-lg font-semibold text-foreground">Route Planning</h2>

            <div className="flex flex-col gap-2 relative">
                <FigmaInput
                    id="startStreet"
                    placeholder="Enter starting point"
                    value={startStreet}
                    onChange={(e) => setStartStreet(e.target.value)}
                    onFocus={() => setActiveField("start")}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSearch}
                />
                <FigmaInput
                    id="endStreet"
                    placeholder="Enter end"
                    value={endStreet}
                    onChange={(e) => setEndStreet(e.target.value)}
                    onFocus={() => setActiveField("end")}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSearch}
                />

                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-background border border-border rounded-md shadow-md z-10 mt-1">
                        {suggestions.map((result, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-2 py-1 hover:bg-accent/20"
                                onClick={() => handleSelectSuggestion(result)}
                            >
                                {result.display_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <Label className="text-sm text-muted-foreground">Transport Mode</Label>
                <RadioGroup defaultValue="car" className="flex flex-row justify-around mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="car" id="car" />
                        <Label htmlFor="car">Car</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="train" id="train" />
                        <Label htmlFor="train">Train</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bicycle" id="bicycle" />
                        <Label htmlFor="bicycle">Bicycle</Label>
                    </div>
                </RadioGroup>
            </div>
        </form>
    )
}
