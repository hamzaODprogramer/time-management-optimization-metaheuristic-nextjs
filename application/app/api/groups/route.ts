import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(groups)
  } catch (error) {
    console.error("Groups fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, size } = await request.json()

    const group = await prisma.group.create({
      data: { name, size },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Groups create error:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
