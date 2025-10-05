import { type NextRequest } from 'next/server'

const VALHALLA_API_URL = "https://valhalla1.openstreetmap.de/route";

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("Request body sent to Valhalla:", JSON.stringify(body, null, 2));
    if (body.exclude_polygons) {
        console.log(`Number of polygons sent: ${body.exclude_polygons.length}`);
        console.log(`Size of polygons payload (bytes): ${JSON.stringify(body.exclude_polygons).length}`);
    }

    try {
        const response = await fetch(VALHALLA_API_URL, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(errorText, { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error("Error fetching route from Valhalla:", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
