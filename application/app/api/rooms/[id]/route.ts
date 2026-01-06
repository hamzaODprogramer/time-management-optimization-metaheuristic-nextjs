import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, capacity, type } = await request.json()

    await prisma.room.update({
      where: { id: Number.parseInt(params.id) },
      data: { name, capacity, type },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Room update error:", error)
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.room.delete({
      where: { id: Number.parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Room delete error:", error)
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}
