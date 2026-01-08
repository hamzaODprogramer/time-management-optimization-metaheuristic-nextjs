import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [totalCourses, totalGroups, totalRooms, totalTeachers] = await Promise.all([
      prisma.course.count(),
      prisma.group.count(),
      prisma.room.count(),
      prisma.teacher.count(),
    ])

    return NextResponse.json({
      totalCourses,
      totalGroups,
      totalRooms,
      totalTeachers,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
