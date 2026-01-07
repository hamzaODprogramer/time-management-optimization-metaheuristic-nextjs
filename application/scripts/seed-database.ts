/**
 * Seed script to populate the database with sample data from the timetabling problem
 * Run with: npx ts-node scripts/seed-database.ts
 */

import { getDB, initializeDatabase } from "../lib/db.ts"

const sampleData = {
  groups: [
    { name: "BA", size: 50 },
    { name: "CI", size: 48 },
    { name: "EE+GARM", size: 48 },
    { name: "ERME", size: 48 },
    { name: "GB & GEG", size: 48 },
    { name: "GC", size: 48 },
    { name: "IEEA", size: 48 },
    { name: "IEGS", size: 48 },
    { name: "IFA", size: 48 },
    { name: "MASTER S1 RD", size: 48 },
    { name: "MIASI", size: 48 },
    { name: "MST RD", size: 48 },
    { name: "MTU", size: 48 },
    { name: "Master IAII", size: 48 },
    { name: "SIR", size: 48 },
    { name: "SIT", size: 48 },
    { name: "TC GB S3", size: 50 },
    { name: "TC S1", size: 50 },
    { name: "TC S1 GB & GEG", size: 50 },
    { name: "TC S3", size: 50 },
  ],
  teachers: [
    "MOHSINE HACHKAR",
    "ABDELGHANI BOUSSAOUD",
    "ABDENNAIM GALADI",
    "SAID EL FEZAZI",
    "BADIA MOUNIR",
    "KHALIL MOKHLIS",
    "ABDELLATIF ZOUANA",
    "ABDALLAH SOULMANI",
    "AHMED MOKHLIS",
    "AHMED EL HACHADI",
    "MOHAMMED KHAYAR",
    "RKIA EL IDRISSI",
    "LAILA EL MAZOUZI",
    "KHALID BENHIDA",
    "ILHAM MOUNIR",
    "MOHAMMED ECHAIBI",
    "ABDESAMAD BOUSSALHI",
  ],
  rooms: [
    { name: "A1", capacity: 400, type: "Amphi" },
    { name: "A2", capacity: 400, type: "Amphi" },
    { name: "A3", capacity: 240, type: "Amphi" },
    { name: "A4", capacity: 400, type: "Amphi" },
    { name: "S5", capacity: 48, type: "Small" },
    { name: "S7", capacity: 48, type: "Small" },
    { name: "S8", capacity: 48, type: "Small" },
    { name: "S9", capacity: 48, type: "Small" },
    { name: "S10", capacity: 48, type: "Small" },
    { name: "S23", capacity: 90, type: "Large" },
    { name: "S24", capacity: 90, type: "Large" },
    { name: "S25", capacity: 90, type: "Large" },
  ],
  timeslots: [
    { day: "LUNDI", start_time: "09:00", end_time: "10:00" },
    { day: "LUNDI", start_time: "10:15", end_time: "11:15" },
    { day: "LUNDI", start_time: "11:30", end_time: "12:30" },
    { day: "LUNDI", start_time: "13:30", end_time: "14:30" },
    { day: "LUNDI", start_time: "14:45", end_time: "15:45" },
    { day: "MARDI", start_time: "09:00", end_time: "10:00" },
    { day: "MARDI", start_time: "10:15", end_time: "11:15" },
    { day: "MARDI", start_time: "11:30", end_time: "12:30" },
    { day: "MARDI", start_time: "13:30", end_time: "14:30" },
    { day: "MARDI", start_time: "14:45", end_time: "15:45" },
    { day: "MERCREDI", start_time: "09:00", end_time: "10:00" },
    { day: "MERCREDI", start_time: "10:15", end_time: "11:15" },
    { day: "MERCREDI", start_time: "11:30", end_time: "12:30" },
    { day: "MERCREDI", start_time: "13:30", end_time: "14:30" },
    { day: "MERCREDI", start_time: "14:45", end_time: "15:45" },
    { day: "JEUDI", start_time: "09:00", end_time: "10:00" },
    { day: "JEUDI", start_time: "10:15", end_time: "11:15" },
    { day: "JEUDI", start_time: "11:30", end_time: "12:30" },
    { day: "JEUDI", start_time: "13:30", end_time: "14:30" },
    { day: "JEUDI", start_time: "14:45", end_time: "15:45" },
    { day: "VENDREDI", start_time: "09:00", end_time: "10:00" },
    { day: "VENDREDI", start_time: "10:15", end_time: "11:15" },
    { day: "VENDREDI", start_time: "11:30", end_time: "12:30" },
    { day: "VENDREDI", start_time: "13:30", end_time: "14:30" },
    { day: "VENDREDI", start_time: "14:45", end_time: "15:45" },
    { day: "SAMEDI", start_time: "09:00", end_time: "10:00" },
    { day: "SAMEDI", start_time: "10:15", end_time: "11:15" },
    { day: "SAMEDI", start_time: "11:30", end_time: "12:30" },
  ],
}

function seed() {
  console.log("🌱 Initializing database...")
  initializeDatabase()
  console.log("✓ Database initialized")

  const db = getDB()

  try {
    // Seed groups
    console.log("📚 Seeding groups...")
    const groupStmt = db.prepare("INSERT INTO groups (name, size) VALUES (?, ?)")
    for (const group of sampleData.groups) {
      groupStmt.run(group.name, group.size)
    }
    console.log(`✓ Added ${sampleData.groups.length} groups`)

    // Seed teachers
    console.log("👨‍🏫 Seeding teachers...")
    const teacherStmt = db.prepare("INSERT INTO teachers (name) VALUES (?)")
    for (const teacher of sampleData.teachers) {
      teacherStmt.run(teacher)
    }
    console.log(`✓ Added ${sampleData.teachers.length} teachers`)

    // Seed rooms
    console.log("🏛️  Seeding rooms...")
    const roomStmt = db.prepare("INSERT INTO rooms (name, capacity, type) VALUES (?, ?, ?)")
    for (const room of sampleData.rooms) {
      roomStmt.run(room.name, room.capacity, room.type)
    }
    console.log(`✓ Added ${sampleData.rooms.length} rooms`)

    // Seed timeslots
    console.log("⏰ Seeding timeslots...")
    const timeslotStmt = db.prepare("INSERT INTO timeslots (day, start_time, end_time) VALUES (?, ?, ?)")
    for (const slot of sampleData.timeslots) {
      timeslotStmt.run(slot.day, slot.start_time, slot.end_time)
    }
    console.log(`✓ Added ${sampleData.timeslots.length} timeslots`)

    // Seed sample courses
    console.log("📖 Seeding sample courses...")
    const courseStmt = db.prepare(
      "INSERT INTO courses (name, group_id, teacher_id, min_capacity, preferred_room_type) VALUES (?, ?, ?, ?, ?)",
    )

    const groups = db.prepare("SELECT id FROM groups LIMIT 5").all() as Array<{ id: number }>
    const teachers = db.prepare("SELECT id FROM teachers LIMIT 5").all() as Array<{ id: number }>

    const sampleCourses = [
      { name: "Mathematics I", min_capacity: 400, type: "Amphi" },
      { name: "Physics Lab", min_capacity: 48, type: "Small" },
      { name: "Programming", min_capacity: 90, type: "Large" },
      { name: "English", min_capacity: 48, type: "Small" },
      { name: "Chemistry", min_capacity: 400, type: "Amphi" },
    ]

    for (let i = 0; i < sampleCourses.length; i++) {
      const course = sampleCourses[i]
      const groupId = groups[i % groups.length].id
      const teacherId = teachers[i % teachers.length].id
      courseStmt.run(course.name, groupId, teacherId, course.min_capacity, course.type)
    }
    console.log(`✓ Added ${sampleCourses.length} sample courses`)

    console.log("\n✨ Database seeded successfully!")
    console.log("\n🎯 Next steps:")
    console.log("1. Start your application: npm run dev")
    console.log("2. Login with admin account (create one on signup page)")
    console.log("3. Add more courses, teachers, and rooms as needed")
    console.log("4. Click 'Generate Optimized Schedule' to create timetable\n")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

seed()
