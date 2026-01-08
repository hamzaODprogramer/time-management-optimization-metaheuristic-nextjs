const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  try {
    // Create groups
    const groups = await prisma.group.createMany({
      data: [
        { name: "TC S1", size: 30 },
        { name: "TC S2", size: 32 },
        { name: "TC S3", size: 28 },
        { name: "Masters 1", size: 25 },
        { name: "Masters 2", size: 23 },
      ],
      skipDuplicates: true,
    })

    console.log(`Created ${groups.count} groups`)

    // Create teachers
    const teachers = await prisma.teacher.createMany({
      data: [
        { name: "Dr. Ahmed Hassan", email: "ahmed@school.edu", phone: "0612345678" },
        { name: "Dr. Fatima El-Morocha", email: "fatima@school.edu", phone: "0612345679" },
        { name: "Prof. Mohammed Karim", email: "karim@school.edu", phone: "0612345680" },
        { name: "Dr. Layla Bennani", email: "layla@school.edu", phone: "0612345681" },
        { name: "Prof. Youssef Alaoui", email: "youssef@school.edu", phone: "0612345682" },
      ],
      skipDuplicates: true,
    })

    console.log(`Created ${teachers.count} teachers`)

    // Create rooms
    const rooms = await prisma.room.createMany({
      data: [
        { name: "Amphi 1", capacity: 150, type: "Amphi" },
        { name: "Amphi 2", capacity: 120, type: "Amphi" },
        { name: "Room 101", capacity: 40, type: "Classroom" },
        { name: "Room 102", capacity: 40, type: "Classroom" },
        { name: "Room 103", capacity: 30, type: "Classroom" },
        { name: "Lab 1", capacity: 25, type: "Lab" },
        { name: "Lab 2", capacity: 25, type: "Lab" },
      ],
      skipDuplicates: true,
    })

    console.log(`Created ${rooms.count} rooms`)

    // Create timeslots
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = [
      { start: "08:00", end: "09:30" },
      { start: "09:45", end: "11:15" },
      { start: "11:30", end: "13:00" },
      { start: "14:00", end: "15:30" },
      { start: "15:45", end: "17:15" },
      { start: "17:30", end: "19:00" },
    ]

    const timeslots = []
    for (const day of days) {
      for (const slot of timeSlots) {
        timeslots.push({
          day,
          startTime: slot.start,
          endTime: slot.end,
        })
      }
    }

    const timeslotResult = await prisma.timeslot.createMany({
      data: timeslots,
      skipDuplicates: true,
    })

    console.log(`Created ${timeslotResult.count} timeslots`)

    // Create courses
    const courseData = [
      { name: "Mathematics I", groupId: 1, teacherId: 1, minCapacity: 30, preferredRoomType: "Classroom" },
      { name: "Physics", groupId: 1, teacherId: 2, minCapacity: 30, preferredRoomType: "Classroom" },
      { name: "Programming I", groupId: 1, teacherId: 3, minCapacity: 25, preferredRoomType: "Lab" },
      { name: "English", groupId: 1, teacherId: 4, minCapacity: 30, preferredRoomType: "Classroom" },
      { name: "Mathematics II", groupId: 2, teacherId: 1, minCapacity: 32, preferredRoomType: "Classroom" },
      { name: "Chemistry", groupId: 2, teacherId: 5, minCapacity: 32, preferredRoomType: "Lab" },
      { name: "Programming II", groupId: 2, teacherId: 3, minCapacity: 25, preferredRoomType: "Lab" },
      { name: "Database Systems", groupId: 3, teacherId: 3, minCapacity: 28, preferredRoomType: "Lab" },
      { name: "Web Development", groupId: 3, teacherId: 4, minCapacity: 28, preferredRoomType: "Lab" },
      { name: "Advanced Math", groupId: 4, teacherId: 1, minCapacity: 25, preferredRoomType: "Classroom" },
    ]

    const courses = await prisma.course.createMany({
      data: courseData,
      skipDuplicates: true,
    })

    console.log(`Created ${courses.count} courses`)

    // Create admin user
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const user = await prisma.user.upsert({
      where: { email: "admin@school.edu" },
      update: {},
      create: {
        email: "admin@school.edu",
        passwordHash: hashedPassword,
        name: "Admin User",
        role: "admin",
      },
    })

    console.log(`Created/verified admin user: ${user.email}`)

    console.log("Database seed completed successfully!")
  } catch (error) {
    console.error("Error during seed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
