import { prisma } from "./prisma"

interface OptimizationResult {
  success: boolean
  message: string
  scheduleCount?: number
}

export async function optimizeSchedule(): Promise<OptimizationResult> {
  try {
    // Clear existing schedule
    await prisma.scheduleItem.deleteMany({})

    // Get all courses with relations, sorted by min capacity (largest first)
    const courses = await prisma.course.findMany({
      orderBy: { minCapacity: "desc" },
    })

    // Get all available rooms sorted by capacity
    const rooms = await prisma.room.findMany({
      orderBy: { capacity: "asc" },
    })

    // Get all timeslots sorted by day and start time
    const timeslots = await prisma.timeslot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    })

    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
      return {
        success: false,
        message: "Not enough data to create a schedule. Please ensure courses, rooms, and timeslots are configured.",
      }
    }

    // Track used slots (room_id + timeslot_id combinations)
    const usedSlots = new Set<string>()
    let scheduledCount = 0

    // Simple assignment algorithm: for each course, find first available room and timeslot
    for (const course of courses) {
      let scheduled = false

      // Try to find suitable room and timeslot
      for (const timeslot of timeslots) {
        if (scheduled) break

        for (const room of rooms) {
          // Check if room meets minimum capacity
          if (room.capacity < course.minCapacity) {
            continue
          }

          // Check if preferred room type matches (if specified)
          if (
            course.preferredRoomType &&
            course.preferredRoomType !== "Any" &&
            room.type !== course.preferredRoomType
          ) {
            continue
          }

          // Check if this slot is available
          const slotKey = `${room.id}_${timeslot.id}`
          if (usedSlots.has(slotKey)) {
            continue
          }

          // Found available slot!
          try {
            await prisma.scheduleItem.create({
              data: {
                courseId: course.id,
                roomId: room.id,
                timeslotId: timeslot.id,
              },
            })
            usedSlots.add(slotKey)
            scheduledCount++
            scheduled = true
            break
          } catch {
            // Skip if insert fails
            continue
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully scheduled ${scheduledCount} courses out of ${courses.length}`,
      scheduleCount: scheduledCount,
    }
  } catch (error) {
    console.error("Optimization error:", error)
    return {
      success: false,
      message: "Error during optimization: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}
