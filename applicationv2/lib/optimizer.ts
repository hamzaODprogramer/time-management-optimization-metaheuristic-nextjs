import { prisma } from "./prisma"

interface TimeSlot {
  day: string
  slot: number
}

interface Assignment {
  eventId: number
  time: TimeSlot
  roomId: number
  teacherId: number | null
}

interface OptimizationResult {
  success: boolean
  message: string
  scheduleCount?: number
  fitness?: number
}

// Simulated Annealing implementation based on FSTM timetabling problem
export async function optimizeSchedule(): Promise<OptimizationResult> {
  try {
    const courses = await prisma.course.findMany({
      include: { group: true, teacher: true },
      orderBy: { minCapacity: "desc" },
    })

    const rooms = await prisma.room.findMany({
      orderBy: { capacity: "asc" },
    })

    const timeslots = await prisma.timeslot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    })

    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
      return {
        success: false,
        message: "Insufficient data for optimization",
      }
    }

    // Parse timeslot to 6 days × 4 slots per day structure
    const days = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"]
    const timeslotMap = new Map<string, TimeSlot[]>()
    days.forEach((day) => {
      timeslotMap.set(day, [])
    })

    // Map timeslots to day/slot index
    for (let i = 0; i < timeslots.length; i++) {
      const slot = timeslots[i]
      const daySlots = timeslotMap.get(slot.day)
      if (daySlots) {
        daySlots.push({ day: slot.day, slot: daySlots.length })
      }
    }

    // Initialize timetable with greedy algorithm
    const assignments: Assignment[] = []
    const usedSlots = new Set<string>()

    // Greedy initialization
    for (const course of courses) {
      let bestFit = null
      let bestFitScore = Number.POSITIVE_INFINITY

      for (const [day, daySlots] of timeslotMap) {
        for (const timeSlot of daySlots) {
          for (const room of rooms) {
            if (room.capacity < course.minCapacity) continue
            if (
              course.preferredRoomType &&
              course.preferredRoomType !== "Any" &&
              room.type !== course.preferredRoomType
            )
              continue

            const slotKey = `${room.id}_${day}_${timeSlot.slot}`
            if (usedSlots.has(slotKey)) continue

            // Score based on capacity waste
            const score = room.capacity - course.minCapacity
            if (score < bestFitScore) {
              bestFitScore = score
              bestFit = { room, timeSlot, day }
            }
          }
        }
      }

      if (bestFit) {
        assignments.push({
          eventId: course.id,
          time: { day: bestFit.day, slot: bestFit.timeSlot.slot },
          roomId: bestFit.room.id,
          teacherId: course.teacherId,
        })
        usedSlots.add(`${bestFit.room.id}_${bestFit.day}_${bestFit.timeSlot.slot}`)
      }
    }

    // Simulated annealing refinement
    let currentAssignments = assignments
    let currentFitness = evaluateFitness(currentAssignments, courses, rooms, days)
    let bestAssignments = JSON.parse(JSON.stringify(currentAssignments))
    let bestFitness = currentFitness

    const maxIters = 1000
    const T_init = 1000
    const alpha = 0.995
    let T = T_init

    for (let iter = 0; iter < maxIters; iter++) {
      // Generate neighbor by moving one event
      const neighbor = JSON.parse(JSON.stringify(currentAssignments)) as Assignment[]

      if (neighbor.length > 0) {
        const idx = Math.floor(Math.random() * neighbor.length)
        const assignment = neighbor[idx]

        // Random new slot
        const dayIndex = Math.floor(Math.random() * days.length)
        const slotIndex = Math.floor(Math.random() * 4)
        assignment.time = { day: days[dayIndex], slot: slotIndex }

        // Find best room for this
        let bestRoom = rooms[0]
        for (const room of rooms) {
          if (room.capacity >= assignment.eventId) {
            bestRoom = room
            break
          }
        }
        assignment.roomId = bestRoom.id
      }

      const neighborFitness = evaluateFitness(neighbor, courses, rooms, days)
      const delta = neighborFitness - currentFitness

      if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
        currentAssignments = neighbor
        currentFitness = neighborFitness
      }

      if (currentFitness < bestFitness) {
        bestAssignments = JSON.parse(JSON.stringify(currentAssignments))
        bestFitness = currentFitness
      }

      T *= alpha
      if (T < 1) break
    }

    // Clear and save optimized schedule
    await prisma.scheduleItem.deleteMany({})

    let saved = 0
    for (const assignment of bestAssignments) {
      try {
        // Map back to timeslot ID
        const daySlots = timeslotMap.get(assignment.time.day) || []
        const timeslotId = timeslots.findIndex((ts) => ts.day === assignment.time.day && daySlots[assignment.time.slot])

        if (timeslotId >= 0) {
          await prisma.scheduleItem.create({
            data: {
              courseId: assignment.eventId,
              roomId: assignment.roomId,
              timeslotId: timeslots[timeslotId].id,
            },
          })
          saved++
        }
      } catch {
        // Skip conflicts
      }
    }

    return {
      success: true,
      message: `Optimized schedule: ${saved}/${courses.length} courses scheduled (fitness: ${bestFitness.toFixed(2)})`,
      scheduleCount: saved,
      fitness: bestFitness,
    }
  } catch (error) {
    console.error("Optimization error:", error)
    return {
      success: false,
      message: "Optimization failed: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}

// Fitness evaluation function
function evaluateFitness(assignments: Assignment[], courses: any[], rooms: any[], days: string[]): number {
  let hardPenalty = 0
  let softPenalty = 0

  // Hard: Unassigned events
  hardPenalty += (courses.length - assignments.length) * 1000

  // Hard: Room capacity violations
  const assignmentMap = new Map<number, Assignment>()
  for (const assignment of assignments) {
    assignmentMap.set(assignment.eventId, assignment)
  }

  for (const course of courses) {
    const assignment = assignmentMap.get(course.id)
    if (assignment) {
      const room = rooms.find((r) => r.id === assignment.roomId)
      if (room && room.capacity < course.minCapacity) {
        hardPenalty += (course.minCapacity - room.capacity) * 20
      }
    }
  }

  // Hard: Room type preferences
  for (const assignment of assignments) {
    const course = courses.find((c) => c.id === assignment.eventId)
    const room = rooms.find((r) => r.id === assignment.roomId)
    if (course && room && course.preferredRoomType && course.preferredRoomType !== room.type) {
      hardPenalty += 1
    }
  }

  // Soft: Consecutive slot distribution
  const dayLoadMap = new Map<string, number>()
  for (const assignment of assignments) {
    const count = dayLoadMap.get(assignment.time.day) || 0
    dayLoadMap.set(assignment.time.day, count + 1)
  }

  const loads = Array.from(dayLoadMap.values())
  if (loads.length > 0) {
    const maxLoad = Math.max(...loads)
    const minLoad = Math.min(...loads)
    softPenalty += (maxLoad - minLoad) * 3
  }

  return hardPenalty * 1000 + softPenalty
}
