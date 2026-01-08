import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get group filter from query params
    const { searchParams } = new URL(request.url)
    const groupFilter = searchParams.get("group") || "all"

    // Fetch schedule items
    const scheduleItems = await prisma.scheduleItem.findMany({
      include: {
        course: { include: { group: true, teacher: true } },
        room: true,
        timeslot: true,
      },
      orderBy: [{ timeslot: { day: "asc" } }, { timeslot: { startTime: "asc" } }],
    })

    // Filter by group if specified
    const filteredItems =
      groupFilter === "all"
        ? scheduleItems
        : scheduleItems.filter((item) => item.course?.group?.name === groupFilter)

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const pageWidth = 842 // A4 landscape
    const pageHeight = 595
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Define colors
    const primaryColor = rgb(0.2, 0.4, 0.9) // Blue
    const lightBlue = rgb(0.93, 0.95, 0.98)
    const borderColor = rgb(0.85, 0.87, 0.9)
    const textColor = rgb(0.15, 0.15, 0.2)
    const mutedColor = rgb(0.5, 0.52, 0.55)
    const headerBg = rgb(0.96, 0.97, 0.98)

    // Layout constants
    const margin = 30
    const headerHeight = 80
    const footerHeight = 30

    // Days configuration
    const daysDb = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayLabels: Record<string, string> = {
      Monday: "LUNDI",
      Tuesday: "MARDI",
      Wednesday: "MERCREDI",
      Thursday: "JEUDI",
      Friday: "VENDREDI",
      Saturday: "SAMEDI",
    }

    // Extract unique time slots
    const timeSlots = Array.from(
      new Set(filteredItems.map((item) => item.timeslot?.startTime || "").filter(Boolean))
    )
      .sort()
      .map((start) => {
        const item = filteredItems.find((i) => i.timeslot?.startTime === start)
        return {
          start,
          end: item?.timeslot?.endTime || "",
          display: `${start.slice(0, 5)} - ${item?.timeslot?.endTime?.slice(0, 5) || ""}`,
        }
      })

    // Calculate grid dimensions
    const gridTop = pageHeight - margin - headerHeight
    const gridBottom = margin + footerHeight
    const gridHeight = gridTop - gridBottom
    const gridLeft = margin
    const gridWidth = pageWidth - margin * 2

    const timeColWidth = 70
    const dayColWidth = (gridWidth - timeColWidth) / daysDb.length
    const rowHeight = Math.min(gridHeight / (timeSlots.length + 1), 70)

    // ============ HEADER ============
    let y = pageHeight - margin

    // Title
    const title = "Schedule Timetable"
    const titleSize = 24
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
    page.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: y - titleSize,
      size: titleSize,
      font: fontBold,
      color: textColor,
    })

    // Subtitle
    y -= 35
    const subtitle = groupFilter === "all" ? "All Groups" : `Group: ${groupFilter}`
    const subtitleSize = 11
    const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize)
    page.drawText(subtitle, {
      x: (pageWidth - subtitleWidth) / 2,
      y: y - subtitleSize,
      size: subtitleSize,
      font,
      color: mutedColor,
    })

    // Date generated
    y -= 18
    const dateText = `Generated: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
    const dateSize = 9
    const dateWidth = font.widthOfTextAtSize(dateText, dateSize)
    page.drawText(dateText, {
      x: (pageWidth - dateWidth) / 2,
      y: y - dateSize,
      size: dateSize,
      font,
      color: mutedColor,
    })

    // ============ GRID ============
    y = gridTop

    // Draw header row background
    page.drawRectangle({
      x: gridLeft,
      y: y - rowHeight,
      width: gridWidth,
      height: rowHeight,
      color: headerBg,
    })

    // Draw header borders
    page.drawRectangle({
      x: gridLeft,
      y: y - rowHeight,
      width: gridWidth,
      height: rowHeight,
      borderColor: borderColor,
      borderWidth: 1.5,
    })

    // Time column header
    const timeHeaderText = "Time"
    const timeHeaderSize = 11
    page.drawText(timeHeaderText, {
      x: gridLeft + (timeColWidth - font.widthOfTextAtSize(timeHeaderText, timeHeaderSize)) / 2,
      y: y - rowHeight / 2 - timeHeaderSize / 2,
      size: timeHeaderSize,
      font: fontBold,
      color: textColor,
    })

    // Day column headers
    daysDb.forEach((day, index) => {
      const dayLabel = dayLabels[day] || day
      const dayX = gridLeft + timeColWidth + index * dayColWidth
      const dayLabelWidth = fontBold.widthOfTextAtSize(dayLabel, timeHeaderSize)

      // Vertical separator
      page.drawLine({
        start: { x: dayX, y: y },
        end: { x: dayX, y: y - rowHeight },
        color: borderColor,
        thickness: 1,
      })

      page.drawText(dayLabel, {
        x: dayX + (dayColWidth - dayLabelWidth) / 2,
        y: y - rowHeight / 2 - timeHeaderSize / 2,
        size: timeHeaderSize,
        font: fontBold,
        color: textColor,
      })
    })

    y -= rowHeight

    // Draw time slots and schedule cells
    timeSlots.forEach((slot, slotIndex) => {
      // Horizontal line
      page.drawLine({
        start: { x: gridLeft, y },
        end: { x: gridLeft + gridWidth, y },
        color: borderColor,
        thickness: 1,
      })

      // Time cell background (light)
      page.drawRectangle({
        x: gridLeft,
        y: y - rowHeight,
        width: timeColWidth,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.99),
      })

      // Time text
      const timeText = slot.display
      const timeSize = 9
      const timeTextWidth = font.widthOfTextAtSize(timeText, timeSize)
      page.drawText(timeText, {
        x: gridLeft + (timeColWidth - timeTextWidth) / 2,
        y: y - rowHeight / 2 - timeSize / 2,
        size: timeSize,
        font,
        color: mutedColor,
      })

      // Vertical separator after time column
      page.drawLine({
        start: { x: gridLeft + timeColWidth, y },
        end: { x: gridLeft + timeColWidth, y: y - rowHeight },
        color: borderColor,
        thickness: 1.5,
      })

      // Draw day cells
      daysDb.forEach((day, dayIndex) => {
        const cellX = gridLeft + timeColWidth + dayIndex * dayColWidth
        const cellY = y - rowHeight
        const cellPadding = 4

        // Find schedule item for this slot and day
        const item = filteredItems.find(
          (i) => i.timeslot?.day === day && i.timeslot?.startTime === slot.start
        )

        // Vertical separator
        if (dayIndex > 0) {
          page.drawLine({
            start: { x: cellX, y },
            end: { x: cellX, y: cellY },
            color: borderColor,
            thickness: 1,
          })
        }

        if (item) {
          // Cell background with color
          page.drawRectangle({
            x: cellX + cellPadding,
            y: cellY + cellPadding,
            width: dayColWidth - cellPadding * 2,
            height: rowHeight - cellPadding * 2,
            color: lightBlue,
            borderColor: primaryColor,
            borderWidth: 1,
          })

          // Course name
          const courseName = item.course?.name || ""
          const courseSize = 9
          const maxCourseWidth = dayColWidth - cellPadding * 4
          let displayCourse = courseName
          if (font.widthOfTextAtSize(courseName, courseSize) > maxCourseWidth) {
            // Truncate if too long
            while (
              font.widthOfTextAtSize(displayCourse + "...", courseSize) > maxCourseWidth &&
              displayCourse.length > 0
            ) {
              displayCourse = displayCourse.slice(0, -1)
            }
            displayCourse += "..."
          }

          page.drawText(displayCourse, {
            x: cellX + cellPadding * 2,
            y: cellY + rowHeight - cellPadding * 2 - courseSize - 2,
            size: courseSize,
            font: fontBold,
            color: textColor,
            maxWidth: maxCourseWidth,
          })

          // Teacher and room
          const teacherRoom = `${item.course?.teacher?.name || ""} • ${item.room?.name || ""}`
          const detailSize = 7
          const maxDetailWidth = dayColWidth - cellPadding * 4
          let displayDetail = teacherRoom
          if (font.widthOfTextAtSize(teacherRoom, detailSize) > maxDetailWidth) {
            while (
              font.widthOfTextAtSize(displayDetail + "...", detailSize) > maxDetailWidth &&
              displayDetail.length > 0
            ) {
              displayDetail = displayDetail.slice(0, -1)
            }
            displayDetail += "..."
          }

          page.drawText(displayDetail, {
            x: cellX + cellPadding * 2,
            y: cellY + rowHeight - cellPadding * 2 - courseSize - detailSize - 6,
            size: detailSize,
            font,
            color: mutedColor,
            maxWidth: maxDetailWidth,
          })

          // Group
          const groupName = item.course?.group?.name || ""
          page.drawText(groupName, {
            x: cellX + cellPadding * 2,
            y: cellY + rowHeight - cellPadding * 2 - courseSize - detailSize * 2 - 10,
            size: detailSize,
            font,
            color: mutedColor,
            maxWidth: maxDetailWidth,
          })
        } else {
          // Empty cell - light background
          page.drawRectangle({
            x: cellX + cellPadding,
            y: cellY + cellPadding,
            width: dayColWidth - cellPadding * 2,
            height: rowHeight - cellPadding * 2,
            color: rgb(0.99, 0.99, 0.99),
            borderColor: borderColor,
            borderWidth: 0.5,
          })

          // "No class" text
          const noClassText = "No class"
          const noClassSize = 7
          const noClassWidth = font.widthOfTextAtSize(noClassText, noClassSize)
          page.drawText(noClassText, {
            x: cellX + (dayColWidth - noClassWidth) / 2,
            y: cellY + rowHeight / 2 - noClassSize / 2,
            size: noClassSize,
            font,
            color: rgb(0.8, 0.8, 0.82),
          })
        }
      })

      y -= rowHeight
    })

    // Bottom border
    page.drawLine({
      start: { x: gridLeft, y },
      end: { x: gridLeft + gridWidth, y },
      color: borderColor,
      thickness: 1.5,
    })

    // Right border
    page.drawLine({
      start: { x: gridLeft + gridWidth, y: gridTop },
      end: { x: gridLeft + gridWidth, y },
      color: borderColor,
      thickness: 1.5,
    })

    // Left border
    page.drawLine({
      start: { x: gridLeft, y: gridTop },
      end: { x: gridLeft, y },
      color: borderColor,
      thickness: 1.5,
    })

    // ============ FOOTER ============
    const footerY = margin + 10
    const footerText = `Page 1 of 1 • ${filteredItems.length} classes scheduled`
    const footerSize = 8
    const footerWidth = font.widthOfTextAtSize(footerText, footerSize)
    page.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: footerY,
      size: footerSize,
      font,
      color: mutedColor,
    })

    // Save and return PDF
    const pdfBytes = await pdfDoc.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=schedule-${groupFilter}-${new Date().toISOString().split("T")[0]}.pdf`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
