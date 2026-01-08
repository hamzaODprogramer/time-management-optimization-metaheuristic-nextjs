import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const scheduleItems = await prisma.scheduleItem.findMany({
      include: {
        course: {
          include: {
            group: true,
            teacher: true,
          },
        },
        room: true,
        timeslot: true,
      },
      orderBy: [{ timeslot: { day: "asc" } }, { timeslot: { startTime: "asc" } }],
    })

    const groups = await prisma.group.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    })

    // also fetch timeslots to let client build a full grid
    const timeslots = await prisma.timeslot.findMany({ orderBy: [{ day: "asc" }, { startTime: "asc" }] })

    const transformedSchedule = scheduleItems.map((item) => ({
      id: item.id,
      course: item.course.name,
      teacher: item.course.teacher?.name || null,
      room: item.room.name,
      groupName: item.course.group.name,
      day: item.timeslot.day,
      startTime: item.timeslot.startTime,
      endTime: item.timeslot.endTime,
    }))

    return NextResponse.json({
      schedule: transformedSchedule,
      groups: groups.map((g) => g.name),
      timeslots: timeslots.map((t) => ({ day: t.day, start: t.startTime, end: t.endTime })),
    })
  } catch (error) {
    console.error("Schedule fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}
