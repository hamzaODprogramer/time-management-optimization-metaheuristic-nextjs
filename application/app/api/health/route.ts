import { getDB } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Health check endpoint for monitoring
 */
export async function GET() {
  try {
    const db = getDB()

    // Simple query to verify database connection
    db.prepare("SELECT 1").get()

    const stats = {
      users: (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count,
      groups: (db.prepare("SELECT COUNT(*) as count FROM groups").get() as { count: number }).count,
      teachers: (db.prepare("SELECT COUNT(*) as count FROM teachers").get() as { count: number }).count,
      rooms: (db.prepare("SELECT COUNT(*) as count FROM rooms").get() as { count: number }).count,
      courses: (db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number }).count,
      schedules: (db.prepare("SELECT COUNT(*) as count FROM schedule").get() as { count: number }).count,
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: stats,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json({ status: "error", message: "Database connection failed" }, { status: 503 })
  }
}
