/**
 * Seed script to populate database with FSTM instance data
 * Contains complete events, rooms, teachers, and groups from instance_fstmv3.json
 * Run with: npx ts-node scripts/seed-fstm-data.ts
 */

import { prisma } from "../lib/prisma"

const fstmData = {
  groups: [
    { name: "BA", size: 50 },
    { name: "BA/BP", size: 50 },
    { name: "CI", size: 95 },
    { name: "EE+GARM", size: 48 },
    { name: "ERME", size: 48 },
    { name: "GB & GEG", size: 48 },
    { name: "GC", size: 48 },
    { name: "IEEA", size: 48 },
    { name: "IEGS", size: 48 },
    { name: "IFA", size: 48 },
    { name: "MIASI", size: 48 },
    { name: "MST RD", size: 48 },
    { name: "MTU", size: 60 },
    { name: "Master IAII", size: 55 },
    { name: "SIR", size: 48 },
    { name: "TC GB S3", size: 50 },
    { name: "TC S1", size: 420 },
    { name: "TC S1 GB & GEG", size: 50 },
    { name: "TC S3", size: 380 },
  ],
  teachers: [
    "Kzaz",
    "ELBOUSHAKI",
    "Bouamama",
    "rhatay",
    "MOHSINE HACHKAR",
    "ABDELGHANI BOUSSAOUD",
    "ABDENNAIM GALADI",
    "SAID EL FEZAZI",
    "BADIA MOUNIR",
    "KHALIL MOKHLIS",
    "ABDELLATIF ZOUANA",
    "ABDALLAH SOULMANI",
    "RKIA EL IDRISSI",
    "LAILA EL MAZOUZI",
    "OTHMANE ALAOUI FDILI",
    "SAID EL ABDELLAOUI",
    "NAJIB BOUMAAZ",
    "ABDELLATIF EL-AZOUZI",
    "AHMED EL HACHADI",
    "ILHAM MOUNIR",
    "ABDESAMAD BOUSSALHI",
  ],
  rooms: [
    { name: "A1", capacity: 400, type: "Amphi" },
    { name: "A2", capacity: 400, type: "Amphi" },
    { name: "A4", capacity: 400, type: "Amphi" },
    { name: "A3", capacity: 240, type: "Amphi" },
    { name: "S5", capacity: 45, type: "Small" },
    { name: "S7", capacity: 48, type: "Small" },
    { name: "S8", capacity: 48, type: "Small" },
    { name: "S9", capacity: 48, type: "Small" },
    { name: "S10", capacity: 48, type: "Small" },
    { name: "S11", capacity: 48, type: "Small" },
    { name: "S12", capacity: 48, type: "Small" },
    { name: "S13", capacity: 48, type: "Small" },
    { name: "S14", capacity: 48, type: "Small" },
    { name: "S15", capacity: 48, type: "Small" },
    { name: "S16", capacity: 48, type: "Small" },
    { name: "S17", capacity: 48, type: "Small" },
    { name: "S18", capacity: 48, type: "Small" },
    { name: "S19", capacity: 48, type: "Small" },
    { name: "S20", capacity: 48, type: "Small" },
    { name: "S21", capacity: 48, type: "Small" },
    { name: "S23", capacity: 90, type: "Large" },
    { name: "S24", capacity: 90, type: "Large" },
    { name: "S25", capacity: 90, type: "Large" },
    { name: "S26", capacity: 90, type: "Large" },
    { name: "S27", capacity: 90, type: "Large" },
    { name: "S28", capacity: 90, type: "Large" },
    { name: "S29", capacity: 90, type: "Large" },
    { name: "S30", capacity: 90, type: "Large" },
    { name: "GC3", capacity: 48, type: "Small" },
    { name: "GC2", capacity: 48, type: "Small" },
    { name: "Ch1", capacity: 48, type: "Small" },
    { name: "Ch2", capacity: 48, type: "Small" },
    { name: "G1", capacity: 48, type: "Small" },
    { name: "G2", capacity: 48, type: "Small" },
  ],
  events: [
    {
      name: "TC S1 - Analyse 1",
      group: "TC S1",
      teacher: "MOHSINE HACHKAR",
      duration_slots: 1,
      min_capacity: 420,
      preferred_room_type: "Amphi",
    },
    {
      name: "TC S3 - Thermodynamique",
      group: "TC S3",
      teacher: "ABDELGHANI BOUSSAOUD",
      duration_slots: 1,
      min_capacity: 380,
      preferred_room_type: "Amphi",
    },
    {
      name: "TC GB S3 - BioCell",
      group: "TC GB S3",
      teacher: "Bouamama",
      duration_slots: 1,
      min_capacity: 50,
      preferred_room_type: "Amphi",
    },
    {
      name: "BA/BP - Géologie",
      group: "BA/BP",
      teacher: "RKIA EL IDRISSI",
      duration_slots: 1,
      min_capacity: 240,
      preferred_room_type: "Amphi",
    },
    {
      name: "TC S3 - TD Algèbre",
      group: "TC S3",
      teacher: "Kzaz",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
    {
      name: "IEEA - Automatique",
      group: "IEEA",
      teacher: "SAID EL ABDELLAOUI",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "GC - RDM",
      group: "GC",
      teacher: "OTHMANE ALAOUI FDILI",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "IEGS - Management",
      group: "IEGS",
      teacher: "NAJIB BOUMAAZ",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "MST RD - Réseaux",
      group: "MST RD",
      teacher: "ABDELLATIF EL-AZOUZI",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "TC S1 - TD Info",
      group: "TC S1",
      teacher: "ELBOUSHAKI",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
    {
      name: "EE+GARM - Electronique",
      group: "EE+GARM",
      teacher: "ABDENNAIM GALADI",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "IFA - Algorithmique",
      group: "IFA",
      teacher: "KHALIL MOKHLIS",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "TC S1 - TD MTU",
      group: "TC S1 GB & GEG",
      teacher: "rhatay",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "SIR - Systèmes",
      group: "SIR",
      teacher: "SAID EL FEZAZI",
      duration_slots: 1,
      min_capacity: 240,
      preferred_room_type: "Amphi",
    },
    {
      name: "BA - BioVégétale",
      group: "BA",
      teacher: "LAILA EL MAZOUZI",
      duration_slots: 1,
      min_capacity: 240,
      preferred_room_type: "Amphi",
    },
    {
      name: "TC S1 GB & GEG - Chimie",
      group: "TC S1 GB & GEG",
      teacher: "BADIA MOUNIR",
      duration_slots: 1,
      min_capacity: 50,
      preferred_room_type: "Amphi",
    },
    {
      name: "TC S3 - TD Civisme",
      group: "TC S3",
      teacher: "ABDELLATIF ZOUANA",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "MIASI - Java",
      group: "MIASI",
      teacher: "ABDALLAH SOULMANI",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "IFA - Programmation Web",
      group: "IFA",
      teacher: "KHALIL MOKHLIS",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "TC S3 - TD Physique",
      group: "TC S3",
      teacher: "ABDENNAIM GALADI",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
    {
      name: "TC GB S3 - TD Biochimie",
      group: "TC GB S3",
      teacher: "Bouamama",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
    {
      name: "Langues - Français",
      group: "ERME",
      teacher: "ABDELLATIF ZOUANA",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "Langues - Anglais",
      group: "IEGS",
      teacher: "ABDELLATIF ZOUANA",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
    },
    {
      name: "Master IAII - Deep Learning",
      group: "Master IAII",
      teacher: "ABDALLAH SOULMANI",
      duration_slots: 2,
      min_capacity: 55,
      preferred_room_type: "Small",
    },
    {
      name: "CI - Digital",
      group: "CI",
      teacher: "ELBOUSHAKI",
      duration_slots: 1,
      min_capacity: 95,
      preferred_room_type: "Small",
    },
    {
      name: "EXAM - TC S1 Maths",
      group: "TC S1",
      teacher: "Kzaz",
      duration_slots: 2,
      min_capacity: 420,
      preferred_room_type: "Amphi",
      is_exam: true,
    },
    {
      name: "EXAM - TC S3 Physics",
      group: "TC S3",
      teacher: "ELBOUSHAKI",
      duration_slots: 2,
      min_capacity: 380,
      preferred_room_type: "Amphi",
      is_exam: true,
    },
    {
      name: "Rattrapage MIASI",
      group: "MIASI",
      teacher: "Bouamama",
      duration_slots: 1,
      min_capacity: 48,
      preferred_room_type: "Small",
      is_provisional: true,
    },
    {
      name: "Seminar Master IAII",
      group: "Master IAII",
      teacher: "rhatay",
      duration_slots: 3,
      min_capacity: 55,
      preferred_room_type: "Small",
    },
    {
      name: "TD Extra TC S1",
      group: "TC S1",
      teacher: "MOHSINE HACHKAR",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
    {
      name: "Workshop CI Digital",
      group: "CI",
      teacher: "ABDELGHANI BOUSSAOUD",
      duration_slots: 2,
      min_capacity: 95,
      preferred_room_type: "Large",
    },
    {
      name: "Provisional Exam BA",
      group: "BA",
      teacher: "RKIA EL IDRISSI",
      duration_slots: 2,
      min_capacity: 50,
      preferred_room_type: "Amphi",
      is_provisional: true,
    },
    {
      name: "Examen MTU",
      group: "MTU",
      teacher: "rhatay",
      duration_slots: 2,
      min_capacity: 60,
      preferred_room_type: "Small",
      is_exam: true,
    },
    {
      name: "TD TC S3 Bio",
      group: "TC S3",
      teacher: "ABDELLATIF ZOUANA",
      duration_slots: 1,
      min_capacity: 90,
      preferred_room_type: "Large",
    },
  ],
  timeslots: [
    { day: "LUNDI", start_time: "08:30", end_time: "09:30" },
    { day: "LUNDI", start_time: "09:00", end_time: "10:00" },
    { day: "LUNDI", start_time: "09:30", end_time: "10:30" },
    { day: "LUNDI", start_time: "10:00", end_time: "11:00" },
    { day: "LUNDI", start_time: "10:30", end_time: "11:30" },
    { day: "LUNDI", start_time: "11:00", end_time: "12:00" },
    { day: "LUNDI", start_time: "11:30", end_time: "12:30" },
    { day: "LUNDI", start_time: "12:00", end_time: "13:00" },
    { day: "LUNDI", start_time: "12:30", end_time: "13:30" },
    { day: "LUNDI", start_time: "13:00", end_time: "14:00" },
    { day: "LUNDI", start_time: "13:30", end_time: "14:30" },
    { day: "LUNDI", start_time: "14:00", end_time: "15:00" },
    { day: "LUNDI", start_time: "14:30", end_time: "15:30" },
    { day: "LUNDI", start_time: "15:00", end_time: "16:00" },
    { day: "LUNDI", start_time: "15:30", end_time: "16:30" },
    { day: "LUNDI", start_time: "16:00", end_time: "17:00" },
    { day: "LUNDI", start_time: "16:30", end_time: "17:30" },
    { day: "LUNDI", start_time: "17:00", end_time: "18:00" },
    { day: "LUNDI", start_time: "17:30", end_time: "18:30" },
    { day: "LUNDI", start_time: "18:00", end_time: "19:00" },
    { day: "LUNDI", start_time: "18:30", end_time: "19:30" },
    // Repeat for other days: MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI
    { day: "MARDI", start_time: "08:30", end_time: "09:30" },
    { day: "MARDI", start_time: "09:00", end_time: "10:00" },
    { day: "MARDI", start_time: "09:30", end_time: "10:30" },
    { day: "MARDI", start_time: "10:00", end_time: "11:00" },
    { day: "MARDI", start_time: "10:30", end_time: "11:30" },
    { day: "MARDI", start_time: "11:00", end_time: "12:00" },
    { day: "MARDI", start_time: "11:30", end_time: "12:30" },
    { day: "MARDI", start_time: "12:00", end_time: "13:00" },
    { day: "MARDI", start_time: "12:30", end_time: "13:30" },
    { day: "MARDI", start_time: "13:00", end_time: "14:00" },
    { day: "MARDI", start_time: "13:30", end_time: "14:30" },
    { day: "MARDI", start_time: "14:00", end_time: "15:00" },
    { day: "MARDI", start_time: "14:30", end_time: "15:30" },
    { day: "MARDI", start_time: "15:00", end_time: "16:00" },
    { day: "MARDI", start_time: "15:30", end_time: "16:30" },
    { day: "MARDI", start_time: "16:00", end_time: "17:00" },
    { day: "MARDI", start_time: "16:30", end_time: "17:30" },
    { day: "MARDI", start_time: "17:00", end_time: "18:00" },
    { day: "MARDI", start_time: "17:30", end_time: "18:30" },
    { day: "MARDI", start_time: "18:00", end_time: "19:00" },
    { day: "MERCREDI", start_time: "08:30", end_time: "09:30" },
    { day: "MERCREDI", start_time: "09:00", end_time: "10:00" },
    { day: "MERCREDI", start_time: "09:30", end_time: "10:30" },
    { day: "MERCREDI", start_time: "10:00", end_time: "11:00" },
    { day: "MERCREDI", start_time: "10:30", end_time: "11:30" },
    { day: "MERCREDI", start_time: "11:00", end_time: "12:00" },
    { day: "MERCREDI", start_time: "11:30", end_time: "12:30" },
    { day: "MERCREDI", start_time: "12:00", end_time: "13:00" },
    { day: "MERCREDI", start_time: "12:30", end_time: "13:30" },
    { day: "MERCREDI", start_time: "13:00", end_time: "14:00" },
    { day: "MERCREDI", start_time: "13:30", end_time: "14:30" },
    { day: "MERCREDI", start_time: "14:00", end_time: "15:00" },
    { day: "MERCREDI", start_time: "14:30", end_time: "15:30" },
    { day: "MERCREDI", start_time: "15:00", end_time: "16:00" },
    { day: "MERCREDI", start_time: "15:30", end_time: "16:30" },
    { day: "MERCREDI", start_time: "16:00", end_time: "17:00" },
    { day: "MERCREDI", start_time: "16:30", end_time: "17:30" },
    { day: "MERCREDI", start_time: "17:00", end_time: "18:00" },
    { day: "MERCREDI", start_time: "17:30", end_time: "18:30" },
    { day: "MERCREDI", start_time: "18:00", end_time: "19:00" },
    { day: "JEUDI", start_time: "08:30", end_time: "09:30" },
    { day: "JEUDI", start_time: "09:00", end_time: "10:00" },
    { day: "JEUDI", start_time: "09:30", end_time: "10:30" },
    { day: "JEUDI", start_time: "10:00", end_time: "11:00" },
    { day: "JEUDI", start_time: "10:30", end_time: "11:30" },
    { day: "JEUDI", start_time: "11:00", end_time: "12:00" },
    { day: "JEUDI", start_time: "11:30", end_time: "12:30" },
    { day: "JEUDI", start_time: "12:00", end_time: "13:00" },
    { day: "JEUDI", start_time: "12:30", end_time: "13:30" },
    { day: "JEUDI", start_time: "13:00", end_time: "14:00" },
    { day: "JEUDI", start_time: "13:30", end_time: "14:30" },
    { day: "JEUDI", start_time: "14:00", end_time: "15:00" },
    { day: "JEUDI", start_time: "14:30", end_time: "15:30" },
    { day: "JEUDI", start_time: "15:00", end_time: "16:00" },
    { day: "JEUDI", start_time: "15:30", end_time: "16:30" },
    { day: "JEUDI", start_time: "16:00", end_time: "17:00" },
    { day: "JEUDI", start_time: "16:30", end_time: "17:30" },
    { day: "JEUDI", start_time: "17:00", end_time: "18:00" },
    { day: "JEUDI", start_time: "17:30", end_time: "18:30" },
    { day: "JEUDI", start_time: "18:00", end_time: "19:00" },
    { day: "VENDREDI", start_time: "08:30", end_time: "09:30" },
    { day: "VENDREDI", start_time: "09:00", end_time: "10:00" },
    { day: "VENDREDI", start_time: "09:30", end_time: "10:30" },
    { day: "VENDREDI", start_time: "10:00", end_time: "11:00" },
    { day: "VENDREDI", start_time: "10:30", end_time: "11:30" },
    { day: "VENDREDI", start_time: "11:00", end_time: "12:00" },
    { day: "VENDREDI", start_time: "11:30", end_time: "12:30" },
    { day: "VENDREDI", start_time: "12:00", end_time: "13:00" },
    { day: "VENDREDI", start_time: "12:30", end_time: "13:30" },
    { day: "VENDREDI", start_time: "13:00", end_time: "14:00" },
    { day: "VENDREDI", start_time: "13:30", end_time: "14:30" },
    { day: "VENDREDI", start_time: "14:00", end_time: "15:00" },
    { day: "VENDREDI", start_time: "14:30", end_time: "15:30" },
    { day: "VENDREDI", start_time: "15:00", end_time: "16:00" },
    { day: "VENDREDI", start_time: "15:30", end_time: "16:30" },
    { day: "VENDREDI", start_time: "16:00", end_time: "17:00" },
    { day: "VENDREDI", start_time: "16:30", end_time: "17:30" },
    { day: "VENDREDI", start_time: "17:00", end_time: "18:00" },
    { day: "VENDREDI", start_time: "17:30", end_time: "18:30" },
    { day: "VENDREDI", start_time: "18:00", end_time: "19:00" },
    { day: "SAMEDI", start_time: "08:30", end_time: "09:30" },
    { day: "SAMEDI", start_time: "09:00", end_time: "10:00" },
    { day: "SAMEDI", start_time: "09:30", end_time: "10:30" },
    { day: "SAMEDI", start_time: "10:00", end_time: "11:00" },
    { day: "SAMEDI", start_time: "10:30", end_time: "11:30" },
    { day: "SAMEDI", start_time: "11:00", end_time: "12:00" },
    { day: "SAMEDI", start_time: "11:30", end_time: "12:30" },
    { day: "SAMEDI", start_time: "12:00", end_time: "13:00" },
    { day: "SAMEDI", start_time: "12:30", end_time: "13:30" },
    { day: "SAMEDI", start_time: "13:00", end_time: "14:00" },
    { day: "SAMEDI", start_time: "13:30", end_time: "14:30" },
    { day: "SAMEDI", start_time: "14:00", end_time: "15:00" },
    { day: "SAMEDI", start_time: "14:30", end_time: "15:30" },
    { day: "SAMEDI", start_time: "15:00", end_time: "16:00" },
    { day: "SAMEDI", start_time: "15:30", end_time: "16:30" },
    { day: "SAMEDI", start_time: "16:00", end_time: "17:00" },
    { day: "SAMEDI", start_time: "16:30", end_time: "17:30" },
    { day: "SAMEDI", start_time: "17:00", end_time: "18:00" },
    { day: "SAMEDI", start_time: "17:30", end_time: "18:30" },
    { day: "SAMEDI", start_time: "18:00", end_time: "19:00" },
  ],
}

async function seedDatabase() {
  try {
    console.log("Seeding database with FSTM instance data...")

    // Clear existing data
    await prisma.scheduleItem.deleteMany({})
    await prisma.course.deleteMany({})
    await prisma.timeslot.deleteMany({})
    await prisma.room.deleteMany({})
    await prisma.teacher.deleteMany({})
    await prisma.group.deleteMany({})

    // Seed groups
    console.log(`Adding ${fstmData.groups.length} groups...`)
    for (const group of fstmData.groups) {
      await prisma.group.create({
        data: { name: group.name, size: group.size },
      })
    }

    // Seed teachers
    console.log(`Adding ${fstmData.teachers.length} teachers...`)
    for (const teacher of fstmData.teachers) {
      await prisma.teacher.create({
        data: { name: teacher },
      })
    }

    // Seed rooms
    console.log(`Adding ${fstmData.rooms.length} rooms...`)
    for (const room of fstmData.rooms) {
      await prisma.room.create({
        data: { name: room.name, capacity: room.capacity, type: room.type },
      })
    }

    // Seed timeslots
    console.log(`Adding ${fstmData.timeslots.length} timeslots...`)
    for (const slot of fstmData.timeslots) {
      await prisma.timeslot.create({
        data: { day: slot.day, startTime: slot.start_time, endTime: slot.end_time },
      })
    }

    // Seed courses/events
    console.log(`Adding ${fstmData.events.length} events...`)
    for (const event of fstmData.events) {
      const group = await prisma.group.findUnique({ where: { name: event.group } })
      const teacher = await prisma.teacher.findUnique({ where: { name: event.teacher } })

      if (group && teacher) {
        await prisma.course.create({
          data: {
            name: event.name,
            groupId: group.id,
            teacherId: teacher.id,
            durationSlots: event.duration_slots,
            minCapacity: event.min_capacity,
            preferredRoomType: event.preferred_room_type,
          },
        })
      }
    }

    console.log("\n✨ FSTM database seeding complete!")
    console.log(`Groups: ${fstmData.groups.length}`)
    console.log(`Teachers: ${fstmData.teachers.length}`)
    console.log(`Rooms: ${fstmData.rooms.length}`)
    console.log(`Timeslots: ${fstmData.timeslots.length}`)
    console.log(`Events/Courses: ${fstmData.events.length}`)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
