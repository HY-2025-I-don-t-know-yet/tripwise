export interface StreetResult {
    lat: number,
    lon: number,
    display_name: string,
    address: Record<string, any>
}

export async function completeStreetName(partialName: string): Promise<StreetResult[]> {
    if (!partialName) return []

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            partialName
        )}&limit=5&format=json&addressdetails=1`

        const response = await fetch(url, {
            headers: { "User-Agent": "travel-task-frontend/1.0" },
        })

        if (!response.ok) {
            throw new Error(`Error fetching street names: ${response.statusText}`)
        }

        const data = await response.json()
        const results: StreetResult[] = data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            address: item.address,
        }))
        return results
    } catch (error) {
        console.error("Failed to fetch street names:", error)
        return []
    }
}