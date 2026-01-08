import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        group: true,
        teacher: true,
      },
      orderBy: { name: "asc" },
    })

    const transformedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      group: course.group.name,
      teacher: course.teacher?.name || null,
      minCapacity: course.minCapacity,
      preferredRoomType: course.preferredRoomType,
    }))

    return NextResponse.json(transformedCourses)
  } catch (error) {
    console.error("Courses fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, groupId, teacherId, minCapacity, preferredRoomType } = await request.json()

    const course = await prisma.course.create({
      data: {
        name,
        groupId,
        teacherId: teacherId || null,
        minCapacity,
        preferredRoomType,
      },
    })

    return NextResponse.json({ id: course.id, name: course.name }, { status: 201 })
  } catch (error) {
    console.error("Courses create error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
