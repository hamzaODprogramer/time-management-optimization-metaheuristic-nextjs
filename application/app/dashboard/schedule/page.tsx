"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleItem {
  id: number
  course: string
  teacher: string
  room: string
  group: string
  startTime: string
  endTime: string
}

interface DaySchedule {
  day: string
  slots: (ScheduleItem | null)[]
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [groups, setGroups] = useState<string[]>([])

  // Database uses English day names; map to French labels for display
  const daysDb = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayLabels: Record<string, string> = {
    Monday: "LUNDI",
    Tuesday: "MARDI",
    Wednesday: "MERCREDI",
    Thursday: "JEUDI",
    Friday: "VENDREDI",
    Saturday: "SAMEDI",
  }

  const [timeSlots, setTimeSlots] = useState<{ start: string; time: string; end?: string }[]>([])

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/schedule")
        if (response.ok) {
          const data = await response.json()

          // Prefer explicit timeslots returned by the API (full set), otherwise derive from schedule
          let slots: { start: string; time: string }[] = []
          if (Array.isArray(data.timeslots) && data.timeslots.length > 0) {
            // use API timeslots (day-aware); but client grid expects per-day slots, so keep start+time
            const uniqueStarts = Array.from(
              new Set(data.timeslots.map((t: any) => (t.start || "").slice(0, 5)))
            ).filter(Boolean)
            uniqueStarts.sort()
            slots = uniqueStarts.map((st: string) => ({ start: st, time: st }))
          } else {
            const starts = Array.from(
              new Set((data.schedule || []).map((s: any) => (s.startTime || "").slice(0, 5)))
            ).filter(Boolean)
            starts.sort()
            slots = starts.map((st: string) => {
              const found = (data.schedule || []).find((s: any) => (s.startTime || "").slice(0, 5) === st)
              return { start: st, time: found ? `${st} - ${(found.endTime || "").slice(0, 5)}` : `${st}` }
            })
          }

          setTimeSlots(slots)

          // Build empty grid: for each day and computed timeslot, default null
          const grid: DaySchedule[] = daysDb.map((day) => ({
            day: dayLabels[day] || day,
            slots: slots.map(() => null),
          }))

            // Place items into grid by matching day and start time (first 5 chars)
            ; (data.schedule || []).forEach((item: any) => {
              const dayIndex = daysDb.indexOf(item.day)
              if (dayIndex === -1) return

              const itemStart = (item.startTime || "").slice(0, 5)
              const slotIndex = slots.findIndex((ts) => ts.start === itemStart)
              if (slotIndex === -1) return

              grid[dayIndex].slots[slotIndex] = {
                id: item.id,
                course: item.course,
                teacher: item.teacher,
                room: item.room,
                group: item.groupName,
                startTime: item.startTime,
                endTime: item.endTime,
              }
            })

          setSchedule(grid)
          setGroups(data.groups || [])
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Schedule Timetable</h1>
            <p className="text-muted-foreground">View and manage the optimized class schedule</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const url = `/api/schedule/pdf${selectedGroup !== "all" ? `?group=${encodeURIComponent(selectedGroup)}` : ""}`
                  const res = await fetch(url)
                  if (!res.ok) throw new Error("Failed to generate PDF")
                  const blob = await res.blob()
                  const downloadUrl = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = downloadUrl
                  a.download = `schedule-${selectedGroup}-${new Date().toISOString().split("T")[0]}.pdf`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(downloadUrl)
                } catch (e) {
                  console.error(e)
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading schedule...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground bg-muted/50 rounded-tl-lg">Time</th>
                  {daysDb.map((day) => (
                    <th key={day} className="text-center p-4 font-semibold text-foreground bg-muted/50 min-w-[200px]">
                      {dayLabels[day] || day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, slotIndex) => (
                  <tr key={slotIndex} className="border-b border-border">
                    <td className="p-4 font-medium text-sm text-muted-foreground bg-muted/25 sticky left-0">
                      {timeSlot.time}
                    </td>
                    {daysDb.map((day, dayIndex) => {
                      const cell = schedule[dayIndex]?.slots[slotIndex] || null
                      return (
                        <td key={`${day}-${slotIndex}`} className="p-2 border-l border-border min-w-[200px] h-24 align-top">
                          {cell ? (
                            <div className="bg-primary/5 rounded-lg p-3 h-full border border-border hover:border-primary/30 transition-colors">
                              <div className="text-sm font-semibold">{cell.course}</div>
                              <div className="text-xs text-muted-foreground">{cell.teacher} • {cell.room}</div>
                              <div className="text-xs text-muted-foreground">{cell.group}</div>
                            </div>
                          ) : (
                            <div className="bg-primary/5 rounded-lg p-3 h-full border border-border hover:border-primary/30 transition-colors">
                              <p className="text-xs text-muted-foreground text-center py-6">No class scheduled</p>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-primary/30"></div>
                <span className="text-sm text-muted-foreground">Regular Class</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-accent/30"></div>
                <span className="text-sm text-muted-foreground">TD/Practical</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-chart-2/30"></div>
                <span className="text-sm text-muted-foreground">Exam</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-destructive/30"></div>
                <span className="text-sm text-muted-foreground">Conflict</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
