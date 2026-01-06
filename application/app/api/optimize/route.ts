import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"

export async function POST() {
  try {
    // Check authentication
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Call Flask backend for optimization
    const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000"

    const response = await fetch(`${flaskUrl}/api/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Optimization failed" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Optimize API error:", error)
    return NextResponse.json(
      {
        error:
          "Failed to optimize schedule. Make sure Flask backend is running on " +
          (process.env.FLASK_BACKEND_URL || "http://localhost:5000"),
      },
      { status: 500 },
    )
  }
}
