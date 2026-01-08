import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Rooms fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, capacity, type } = await request.json()

    const room = await prisma.room.create({
      data: { name, capacity, type },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("Rooms create error:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
