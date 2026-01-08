/**
 * Seed script to populate MySQL database with data from instance_fstmv3.json
 * Uses Prisma for MySQL connection
 * Run with: node scripts/seed-from-instance-prisma.js
 */

const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

// Load data from instance_fstmv3.json
const instancePath = path.join(process.cwd(), "instance_fstmv3.json")
const instanceData = JSON.parse(fs.readFileSync(instancePath, "utf-8"))

// Define timeslots based on standard academic schedule
const timeslots = [
    // Lundi
    { day: "Monday", start_time: "08:30", end_time: "09:00" },
    { day: "Monday", start_time: "09:00", end_time: "10:00" },
    { day: "Monday", start_time: "10:00", end_time: "10:30" },
    { day: "Monday", start_time: "10:30", end_time: "11:00" },
    { day: "Monday", start_time: "11:00", end_time: "11:30" },
    { day: "Monday", start_time: "11:30", end_time: "12:00" },
    { day: "Monday", start_time: "12:00", end_time: "12:30" },
    { day: "Monday", start_time: "12:30", end_time: "13:00" },
    { day: "Monday", start_time: "13:00", end_time: "13:30" },
    { day: "Monday", start_time: "13:30", end_time: "14:00" },
    { day: "Monday", start_time: "14:00", end_time: "14:30" },
    { day: "Monday", start_time: "14:30", end_time: "15:00" },
    { day: "Monday", start_time: "15:00", end_time: "15:30" },
    { day: "Monday", start_time: "15:30", end_time: "16:00" },
    { day: "Monday", start_time: "16:00", end_time: "16:30" },
    { day: "Monday", start_time: "16:30", end_time: "17:00" },
    { day: "Monday", start_time: "17:00", end_time: "17:30" },
    { day: "Monday", start_time: "17:30", end_time: "18:00" },
    // Repeat for other days...
    { day: "Tuesday", start_time: "08:30", end_time: "09:00" },
    { day: "Tuesday", start_time: "09:00", end_time: "10:00" },
    { day: "Tuesday", start_time: "10:00", end_time: "10:30" },
    { day: "Tuesday", start_time: "10:30", end_time: "11:00" },
    { day: "Tuesday", start_time: "11:00", end_time: "11:30" },
    { day: "Tuesday", start_time: "11:30", end_time: "12:00" },
    { day: "Tuesday", start_time: "12:00", end_time: "12:30" },
    { day: "Tuesday", start_time: "12:30", end_time: "13:00" },
    { day: "Tuesday", start_time: "13:00", end_time: "13:30" },
    { day: "Tuesday", start_time: "13:30", end_time: "14:00" },
    { day: "Tuesday", start_time: "14:00", end_time: "14:30" },
    { day: "Tuesday", start_time: "14:30", end_time: "15:00" },
    { day: "Tuesday", start_time: "15:00", end_time: "15:30" },
    { day: "Tuesday", start_time: "15:30", end_time: "16:00" },
    { day: "Tuesday", start_time: "16:00", end_time: "16:30" },
    { day: "Tuesday", start_time: "16:30", end_time: "17:00" },
    { day: "Tuesday", start_time: "17:00", end_time: "17:30" },
    { day: "Tuesday", start_time: "17:30", end_time: "18:00" },
    // Continue for other days - abbreviated for brevity
    // You can add Wednesday-Saturday following the same pattern
]

// Generate all timeslots for all days
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const allTimeslots = []
const timePoints = [
    "08:30", "09:00", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30"
]

for (const day of days) {
    for (let i = 0; i < timePoints.length - 1; i++) {
        allTimeslots.push({
            day,
            startTime: timePoints[i],
            endTime: timePoints[i + 1]
        })
    }
}

async function seed() {
    console.log("🌱 Initializing MySQL database from instance_fstmv3.json...")

    try {
        // Clear existing data (in reverse order of dependencies)
        console.log("🧹 Clearing existing data...")
        await prisma.scheduleItem.deleteMany({})
        await prisma.course.deleteMany({})
        await prisma.timeslot.deleteMany({})
        await prisma.room.deleteMany({})
        await prisma.teacher.deleteMany({})
        await prisma.group.deleteMany({})
        console.log("✓ Existing data cleared")

        // Seed groups
        console.log("📚 Seeding groups from instance file...")
        const groupResults = await prisma.group.createMany({
            data: instanceData.groups.map(g => ({
                name: g.name,
                size: g.size
            })),
            skipDuplicates: true
        })
        console.log(`✓ Added ${groupResults.count} groups`)

        // Seed teachers
        console.log("👨‍🏫 Seeding teachers from instance file...")
        const teacherResults = await prisma.teacher.createMany({
            data: instanceData.teachers.map(t => ({
                name: t
            })),
            skipDuplicates: true
        })
        console.log(`✓ Added ${teacherResults.count} teachers`)

        // Seed rooms
        console.log("🏛️  Seeding rooms from instance file...")
        const roomResults = await prisma.room.createMany({
            data: instanceData.rooms.map(r => ({
                name: r.name,
                capacity: r.capacity,
                type: r.type
            })),
            skipDuplicates: true
        })
        console.log(`✓ Added ${roomResults.count} rooms`)

        // Seed timeslots
        console.log("⏰ Seeding timeslots...")
        const timeslotResults = await prisma.timeslot.createMany({
            data: allTimeslots,
            skipDuplicates: true
        })
        console.log(`✓ Added ${timeslotResults.count} timeslots`)

        // Seed courses (events)
        console.log("📖 Seeding courses from instance file...")

        // Get all groups and teachers for mapping
        const groups = await prisma.group.findMany()
        const teachers = await prisma.teacher.findMany()

        const groupMap = new Map(groups.map(g => [g.name, g.id]))
        const teacherMap = new Map(teachers.map(t => [t.name, t.id]))

        let coursesAdded = 0
        for (const event of instanceData.events) {
            const groupId = groupMap.get(event.group)
            const teacherId = teacherMap.get(event.teacher)

            if (!groupId) {
                console.warn(`⚠ Warning: Group "${event.group}" not found for event "${event.name}"`)
                continue
            }

            await prisma.course.create({
                data: {
                    name: event.name,
                    groupId: groupId,
                    teacherId: teacherId || null,
                    durationSlots: event.duration_slots || 1,
                    minCapacity: event.min_capacity,
                    preferredRoomType: event.preferred_room_type || null
                }
            })
            coursesAdded++
        }
        console.log(`✓ Added ${coursesAdded} courses`)

        console.log("\n✨ MySQL database seeded successfully from instance_fstmv3.json!")
        console.log("\n🎯 Next steps:")
        console.log("1. Start your application: npm run dev")
        console.log("2. Login with admin account")
        console.log("3. Navigate to Dashboard")
        console.log("4. Click 'Generate Optimized Schedule' to create timetable\n")
    } catch (error) {
        console.error("❌ Seeding failed:", error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

seed()
