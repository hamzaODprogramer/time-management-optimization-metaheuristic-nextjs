import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Teachers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error("Teachers create error:", error)
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 })
  }
}
