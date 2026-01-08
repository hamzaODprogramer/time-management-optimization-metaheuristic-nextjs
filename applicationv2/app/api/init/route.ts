import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * Initialize database endpoint
 * Creates a sample data record to verify connection
 */
export async function POST() {
  try {
    const groupCount = await prisma.group.count()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      hasData: groupCount > 0,
    })
  } catch (error) {
    console.error("Init error:", error)
    return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 })
  }
}
