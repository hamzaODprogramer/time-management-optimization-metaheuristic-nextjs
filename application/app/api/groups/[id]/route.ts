import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, size } = await request.json()

    await prisma.group.update({
      where: { id: Number.parseInt(params.id) },
      data: { name, size },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Group update error:", error)
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.group.delete({
      where: { id: Number.parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Group delete error:", error)
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
  }
}
