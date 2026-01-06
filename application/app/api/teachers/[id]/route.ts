import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, phone } = await request.json()

    await prisma.teacher.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Teacher update error:", error)
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.teacher.delete({
      where: { id: Number.parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Teacher delete error:", error)
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
  }
}
