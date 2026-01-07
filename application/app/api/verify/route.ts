import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        // Check authentication
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Call Flask backend for verification
        const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000"

        const response = await fetch(`${flaskUrl}/api/verify`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.message || "Verification failed" }, { status: response.status })
        }

        const result = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        console.error("Verify API error:", error)
        return NextResponse.json(
            {
                error:
                    "Failed to verify schedule. Make sure Flask backend is running on " +
                    (process.env.FLASK_BACKEND_URL || "http://localhost:5000"),
            },
            { status: 500 },
        )
    }
}
