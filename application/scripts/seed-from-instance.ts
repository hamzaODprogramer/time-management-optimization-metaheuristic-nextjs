/**
 * Seed script to populate the database with data from instance_fstmv3.json
 * Run with: npx ts-node scripts/seed-from-instance.ts
 */

import { getDB, initializeDatabase } from "../lib/db"
import * as fs from "fs"
import * as path from "path"

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
    // Mardi
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
    // Mercredi  
    { day: "Wednesday", start_time: "08:30", end_time: "09:00" },
    { day: "Wednesday", start_time: "09:00", end_time: "10:00" },
    { day: "Wednesday", start_time: "10:00", end_time: "10:30" },
    { day: "Wednesday", start_time: "10:30", end_time: "11:00" },
    { day: "Wednesday", start_time: "11:00", end_time: "11:30" },
    { day: "Wednesday", start_time: "11:30", end_time: "12:00" },
    { day: "Wednesday", start_time: "12:00", end_time: "12:30" },
    { day: "Wednesday", start_time: "12:30", end_time: "13:00" },
    { day: "Wednesday", start_time: "13:00", end_time: "13:30" },
    { day: "Wednesday", start_time: "13:30", end_time: "14:00" },
    { day: "Wednesday", start_time: "14:00", end_time: "14:30" },
    { day: "Wednesday", start_time: "14:30", end_time: "15:00" },
    { day: "Wednesday", start_time: "15:00", end_time: "15:30" },
    { day: "Wednesday", start_time: "15:30", end_time: "16:00" },
    { day: "Wednesday", start_time: "16:00", end_time: "16:30" },
    { day: "Wednesday", start_time: "16:30", end_time: "17:00" },
    { day: "Wednesday", start_time: "17:00", end_time: "17:30" },
    { day: "Wednesday", start_time: "17:30", end_time: "18:00" },
    // Jeudi
    { day: "Thursday", start_time: "08:30", end_time: "09:00" },
    { day: "Thursday", start_time: "09:00", end_time: "10:00" },
    { day: "Thursday", start_time: "10:00", end_time: "10:30" },
    { day: "Thursday", start_time: "10:30", end_time: "11:00" },
    { day: "Thursday", start_time: "11:00", end_time: "11:30" },
    { day: "Thursday", start_time: "11:30", end_time: "12:00" },
    { day: "Thursday", start_time: "12:00", end_time: "12:30" },
    { day: "Thursday", start_time: "12:30", end_time: "13:00" },
    { day: "Thursday", start_time: "13:00", end_time: "13:30" },
    { day: "Thursday", start_time: "13:30", end_time: "14:00" },
    { day: "Thursday", start_time: "14:00", end_time: "14:30" },
    { day: "Thursday", start_time: "14:30", end_time: "15:00" },
    { day: "Thursday", start_time: "15:00", end_time: "15:30" },
    { day: "Thursday", start_time: "15:30", end_time: "16:00" },
    { day: "Thursday", start_time: "16:00", end_time: "16:30" },
    { day: "Thursday", start_time: "16:30", end_time: "17:00" },
    { day: "Thursday", start_time: "17:00", end_time: "17:30" },
    { day: "Thursday", start_time: "17:30", end_time: "18:00" },
    // Vendredi
    { day: "Friday", start_time: "08:30", end_time: "09:00" },
    { day: "Friday", start_time: "09:00", end_time: "10:00" },
    { day: "Friday", start_time: "10:00", end_time: "10:30" },
    { day: "Friday", start_time: "10:30", end_time: "11:00" },
    { day: "Friday", start_time: "11:00", end_time: "11:30" },
    { day: "Friday", start_time: "11:30", end_time: "12:00" },
    { day: "Friday", start_time: "12:00", end_time: "12:30" },
    { day: "Friday", start_time: "12:30", end_time: "13:00" },
    { day: "Friday", start_time: "13:00", end_time: "13:30" },
    { day: "Friday", start_time: "13:30", end_time: "14:00" },
    { day: "Friday", start_time: "14:00", end_time: "14:30" },
    { day: "Friday", start_time: "14:30", end_time: "15:00" },
    { day: "Friday", start_time: "15:00", end_time: "15:30" },
    { day: "Friday", start_time: "15:30", end_time: "16:00" },
    { day: "Friday", start_time: "16:00", end_time: "16:30" },
    { day: "Friday", start_time: "16:30", end_time: "17:00" },
    { day: "Friday", start_time: "17:00", end_time: "17:30" },
    { day: "Friday", start_time: "17:30", end_time: "18:00" },
    // Samedi
    { day: "Saturday", start_time: "08:30", end_time: "09:00" },
    { day: "Saturday", start_time: "09:00", end_time: "10:00" },
    { day: "Saturday", start_time: "10:00", end_time: "10:30" },
    { day: "Saturday", start_time: "10:30", end_time: "11:00" },
    { day: "Saturday", start_time: "11:00", end_time: "11:30" },
    { day: "Saturday", start_time: "11:30", end_time: "12:00" },
    { day: "Saturday", start_time: "12:00", end_time: "12:30" },
    { day: "Saturday", start_time: "12:30", end_time: "13:00" },
    { day: "Saturday", start_time: "13:00", end_time: "13:30" },
    { day: "Saturday", start_time: "13:30", end_time: "14:00" },
    { day: "Saturday", start_time: "14:00", end_time: "14:30" },
    { day: "Saturday", start_time: "14:30", end_time: "15:00" },
    { day: "Saturday", start_time: "15:00", end_time: "15:30" },
    { day: "Saturday", start_time: "15:30", end_time: "16:00" },
    { day: "Saturday", start_time: "16:00", end_time: "16:30" },
    { day: "Saturday", start_time: "16:30", end_time: "17:00" },
    { day: "Saturday", start_time: "17:00", end_time: "17:30" },
    { day: "Saturday", start_time: "17:30", end_time: "18:00" },
]

function seed() {
    console.log("🌱 Initializing database from instance_fstmv3.json...")
    initializeDatabase()
    console.log("✓ Database initialized")

    const db = getDB()

    try {
        // Clear existing data (in reverse order of dependencies)
        console.log("🧹 Clearing existing data...")
        db.prepare("DELETE FROM schedule").run()
        db.prepare("DELETE FROM courses").run()
        db.prepare("DELETE FROM timeslots").run()
        db.prepare("DELETE FROM rooms").run()
        db.prepare("DELETE FROM teachers").run()
        db.prepare("DELETE FROM groups").run()
        console.log("✓ Existing data cleared")

        // Seed groups
        console.log("📚 Seeding groups from instance file...")
        const groupStmt = db.prepare("INSERT INTO groups (name, size) VALUES (?, ?)")
        for (const group of instanceData.groups) {
            groupStmt.run(group.name, group.size)
        }
        console.log(`✓ Added ${instanceData.groups.length} groups`)

        // Seed teachers
        console.log("👨‍🏫 Seeding teachers from instance file...")
        const teacherStmt = db.prepare("INSERT INTO teachers (name) VALUES (?)")
        for (const teacher of instanceData.teachers) {
            teacherStmt.run(teacher)
        }
        console.log(`✓ Added ${instanceData.teachers.length} teachers`)

        // Seed rooms
        console.log("🏛️  Seeding rooms from instance file...")
        const roomStmt = db.prepare("INSERT INTO rooms (name, capacity, type) VALUES (?, ?, ?)")
        for (const room of instanceData.rooms) {
            roomStmt.run(room.name, room.capacity, room.type)
        }
        console.log(`✓ Added ${instanceData.rooms.length} rooms`)

        // Seed timeslots
        console.log("⏰ Seeding timeslots...")
        const timeslotStmt = db.prepare("INSERT INTO timeslots (day, start_time, end_time) VALUES (?, ?, ?)")
        for (const slot of timeslots) {
            timeslotStmt.run(slot.day, slot.start_time, slot.end_time)
        }
        console.log(`✓ Added ${timeslots.length} timeslots`)

        // Seed courses (events)
        console.log("📖 Seeding courses from instance file...")

        // First, get all group and teacher IDs for mapping
        const groupMap = new Map<string, number>()
        const groups = db.prepare("SELECT id, name FROM groups").all() as Array<{ id: number; name: string }>
        groups.forEach((g) => groupMap.set(g.name, g.id))

        const teacherMap = new Map<string, number>()
        const teachers = db.prepare("SELECT id, name FROM teachers").all() as Array<{ id: number; name: string }>
        teachers.forEach((t) => teacherMap.set(t.name, t.id))

        const courseStmt = db.prepare(
            `INSERT INTO courses (name, group_id, teacher_id, duration_slots, min_capacity, preferred_room_type) 
       VALUES (?, ?, ?, ?, ?, ?)`
        )

        for (const event of instanceData.events) {
            const groupId = groupMap.get(event.group)
            const teacherId = teacherMap.get(event.teacher)

            if (!groupId) {
                console.warn(`⚠ Warning: Group "${event.group}" not found for event "${event.name}"`)
                continue
            }

            courseStmt.run(
                event.name,
                groupId,
                teacherId || null,
                event.duration_slots || 1,
                event.min_capacity,
                event.preferred_room_type || null
            )
        }
        console.log(`✓ Added ${instanceData.events.length} courses`)

        console.log("\n✨ Database seeded successfully from instance_fstmv3.json!")
        console.log("\n🎯 Next steps:")
        console.log("1. Start your application: npm run dev")
        console.log("2. Login with admin account")
        console.log("3. Navigate to Dashboard")
        console.log("4. Click 'Generate Optimized Schedule' to create timetable\n")
    } catch (error) {
        console.error("❌ Seeding failed:", error)
        process.exit(1)
    }
}

seed()
