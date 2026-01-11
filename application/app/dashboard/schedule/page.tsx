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
  slots: ScheduleItem[][] // Array of arrays - multiple courses per time slot
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [groups, setGroups] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

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
            const uniqueStarts = Array.from(
              new Set(data.timeslots.map((t: any) => (t.start || "").slice(0, 5)))
            ).filter(Boolean) as string[]
            uniqueStarts.sort()
            slots = uniqueStarts.map((st: string) => ({ start: st, time: st }))
          } else {
            const starts = Array.from(
              new Set((data.schedule || []).map((s: any) => (s.startTime || "").slice(0, 5)))
            ).filter(Boolean) as string[]
            starts.sort()
            slots = starts.map((st: string) => {
              const found = (data.schedule || []).find((s: any) => (s.startTime || "").slice(0, 5) === st)
              return { start: st, time: found ? `${st} - ${(found.endTime || "").slice(0, 5)}` : `${st}` }
            })
          }

          setTimeSlots(slots)

          // Build empty grid: for each day and timeslot, create array for multiple courses
          const grid: DaySchedule[] = daysDb.map((day) => ({
            day: dayLabels[day] || day,
            slots: slots.map(() => []), // Array of empty arrays for each slot
          }))

            // Place items into grid - can have multiple courses per (day,time)
            ; (data.schedule || []).forEach((item: any) => {
              const dayIndex = daysDb.indexOf(item.day)
              if (dayIndex === -1) return

              const itemStart = (item.startTime || "").slice(0, 5)
              const slotIndex = slots.findIndex((ts) => ts.start === itemStart)
              if (slotIndex === -1) return

              // Add to the array (not replace)
              grid[dayIndex].slots[slotIndex].push({
                id: item.id,
                course: item.course,
                teacher: item.teacher,
                room: item.room,
                group: item.groupName,
                startTime: item.startTime,
                endTime: item.endTime,
              })
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

  // Filter by selected group
  const filteredSchedule = selectedGroup === "all"
    ? schedule
    : schedule.map(day => ({
      ...day,
      slots: day.slots.map(slotItems =>
        slotItems.filter(item => item.group === selectedGroup)
      )
    }))

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
          <Card className="shadow-lg">
            <CardContent className="py-16 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                <p className="text-lg font-medium text-gray-600">Loading schedule...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-center p-4 font-bold text-gray-800 border-r border-gray-300 min-w-[120px] sticky left-0 bg-gray-100 z-10">
                    Time
                  </th>
                  {daysDb.map((day) => (
                    <th key={day} className="text-center p-4 font-bold text-gray-800 border-r border-gray-300 min-w-[200px] last:border-r-0">
                      {dayLabels[day] || day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, slotIndex) => (
                  <tr key={slotIndex} className="border-b border-gray-200">
                    <td className="p-3 font-semibold text-sm text-gray-700 bg-gray-50 border-r border-gray-300 sticky left-0 z-10 text-center">
                      {timeSlot.time}
                    </td>
                    {daysDb.map((day, dayIndex) => {
                      const cellItems = filteredSchedule[dayIndex]?.slots[slotIndex] || []

                      return (
                        <td key={`${day}-${slotIndex}`} className="p-2 border-r border-gray-200 min-w-[200px] align-top bg-gray-50 last:border-r-0">
                          {cellItems.length > 0 ? (
                            <div className="space-y-2">
                              {cellItems.map((cell, idx) => {
                                const itemKey = `${cell.id}-${slotIndex}-${dayIndex}`
                                const isExpanded = expandedItems.has(itemKey)

                                return (
                                  <div
                                    key={itemKey}
                                    onClick={() => {
                                      const newExpanded = new Set(expandedItems)
                                      if (isExpanded) {
                                        newExpanded.delete(itemKey)
                                      } else {
                                        newExpanded.add(itemKey)
                                      }
                                      setExpandedItems(newExpanded)
                                    }}
                                    className={`
                                      bg-white rounded border-2 border-blue-500 p-2.5 cursor-pointer 
                                      hover:shadow-lg transition-all duration-300
                                      ${isExpanded ? 'w-full' : 'w-auto'}
                                    `}
                                  >
                                    {/* Compact view - cours, salle, groupe */}
                                    <div className={isExpanded ? 'mb-2' : ''}>
                                      <div className="text-xs font-bold text-gray-900">
                                        {cell.course}
                                      </div>
                                      <div className="text-[10px] text-gray-600 mt-1">
                                        🏛️ {cell.room}
                                      </div>
                                      <div className="text-[10px] text-gray-500">
                                        👥 {cell.group}
                                      </div>
                                    </div>

                                    {/* Expanded details - prof + horaire */}
                                    {isExpanded && (
                                      <div className="pt-2 border-t border-gray-200 space-y-1">
                                        <div className="text-[10px] text-gray-700">
                                          <span className="font-semibold">Prof:</span> {cell.teacher}
                                        </div>
                                        <div className="text-[10px] text-gray-700">
                                          <span className="font-semibold">Horaire:</span> {cell.startTime} - {cell.endTime}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="h-20 flex items-center justify-center text-gray-300 text-xs">
                              No class
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
                <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-600"></div>
                <span className="text-sm text-muted-foreground">Regular Class</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-white border-2 border-blue-500"></div>
                <span className="text-sm text-muted-foreground">Click to expand details</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
