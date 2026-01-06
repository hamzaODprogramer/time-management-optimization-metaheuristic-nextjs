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

  const days = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"]

  const timeSlots = [
    { slot: 1, time: "09:00 - 10:00" },
    { slot: 2, time: "10:15 - 11:15" },
    { slot: 3, time: "11:30 - 12:30" },
    { slot: 4, time: "13:30 - 14:30" },
    { slot: 5, time: "14:45 - 15:45" },
  ]

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/schedule")
        if (response.ok) {
          const data = await response.json()
          setSchedule(data.schedule || [])
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
                  {days.map((day) => (
                    <th key={day} className="text-center p-4 font-semibold text-foreground bg-muted/50 min-w-[200px]">
                      {day}
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
                    {days.map((day) => (
                      <td
                        key={`${day}-${slotIndex}`}
                        className="p-2 border-l border-border min-w-[200px] h-24 align-top"
                      >
                        <div className="bg-primary/5 rounded-lg p-3 h-full border border-border hover:border-primary/30 transition-colors">
                          {/* Placeholder for schedule items */}
                          <p className="text-xs text-muted-foreground text-center py-6">No class scheduled</p>
                        </div>
                      </td>
                    ))}
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
