import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, groupId, teacherId, minCapacity, preferredRoomType } = await request.json()

    await prisma.course.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        name,
        groupId,
        teacherId: teacherId || null,
        minCapacity,
        preferredRoomType,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Course update error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.course.delete({
      where: { id: Number.parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Course delete error:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
