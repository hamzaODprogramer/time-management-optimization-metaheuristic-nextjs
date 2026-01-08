"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ScheduleEntry {
  id: number
  course: string
  teacher: string | null
  room: string
  groupName: string
  day: string
  startTime: string
  endTime: string
}

interface ScheduleDisplayProps {
  scheduleData?: ScheduleEntry[]
  onRefresh?: () => void
}

export function ScheduleDisplay({ scheduleData = [], onRefresh }: ScheduleDisplayProps) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(scheduleData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scheduleData.length > 0) {
      setSchedule(scheduleData)
    }
  }, [scheduleData])

  const fetchSchedule = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/schedule")
      const data = await response.json()
      setSchedule(data.schedule || [])
      onRefresh?.()
    } catch (error) {
      console.error("Failed to fetch schedule:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group schedule by day and time
  const daysOrder = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"]
  const groupedByDay = new Map<string, ScheduleEntry[]>()

  schedule.forEach((entry) => {
    if (!groupedByDay.has(entry.day)) {
      groupedByDay.set(entry.day, [])
    }
    groupedByDay.get(entry.day)!.push(entry)
  })

  // Get all unique timeslots
  const timeslotSet = new Set<string>()
  schedule.forEach((entry) => {
    timeslotSet.add(`${entry.startTime}-${entry.endTime}`)
  })
  const timeslots = Array.from(timeslotSet).sort()

  // Get all unique rooms
  const roomSet = new Set<string>()
  schedule.forEach((entry) => {
    roomSet.add(entry.room)
  })
  const rooms = Array.from(roomSet).sort()

  // Get all unique groups
  const groupSet = new Set<string>()
  schedule.forEach((entry) => {
    groupSet.add(entry.groupName)
  })
  const groups = Array.from(groupSet).sort()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Timetable Schedule</CardTitle>
        <CardDescription>Optimized class schedule for all rooms and groups</CardDescription>
        <Button onClick={fetchSchedule} disabled={isLoading} className="mt-4 w-32">
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No schedule data available. Generate an optimized schedule first.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Timetable View */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Schedule Grid by Time</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary/10 border-b">
                      <th className="border px-3 py-2 text-left font-semibold min-w-24">Jour/Horaire</th>
                      {timeslots.map((slot, idx) => (
                        <th key={idx} className="border px-3 py-2 text-center font-semibold min-w-32 text-xs">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daysOrder
                      .filter((day) => groupedByDay.has(day))
                      .map((day) => (
                        <tr key={day} className="border-b hover:bg-accent/5">
                          <td className="border px-3 py-2 font-semibold bg-primary/5">{day}</td>
                          {timeslots.map((slot, idx) => {
                            const [startTime, endTime] = slot.split("-")
                            const entries =
                              groupedByDay
                                .get(day)
                                ?.filter((e) => e.startTime === startTime && e.endTime === endTime) || []

                            return (
                              <td key={idx} className="border px-2 py-2 text-xs text-center align-top">
                                {entries.map((entry, i) => (
                                  <div
                                    key={i}
                                    className="mb-1 p-1 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800"
                                  >
                                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                                      {entry.groupName}
                                    </div>
                                    <div className="text-xs">{entry.course}</div>
                                    <div className="text-xs text-muted-foreground">{entry.room}</div>
                                    <div className="text-xs font-medium text-blue-800 dark:text-blue-300">
                                      {entry.teacher}
                                    </div>
                                  </div>
                                ))}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rooms View */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Schedule by Room</h3>
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room) => {
                  const roomSchedule = schedule.filter((e) => e.room === room)
                  return (
                    <Card key={room} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{room}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {roomSchedule.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No classes scheduled</p>
                        ) : (
                          <div className="space-y-2">
                            {roomSchedule
                              .sort((a, b) => {
                                const dayCompare = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
                                return dayCompare !== 0 ? dayCompare : a.startTime.localeCompare(b.startTime)
                              })
                              .map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold">{entry.groupName}</div>
                                    <div className="text-xs text-muted-foreground">{entry.course}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {entry.teacher} | {entry.day} {entry.startTime}-{entry.endTime}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Groups View */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Schedule by Group</h3>
              <div className="grid grid-cols-1 gap-4">
                {groups.map((group) => {
                  const groupSchedule = schedule.filter((e) => e.groupName === group)
                  return (
                    <Card key={group} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{group}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {groupSchedule.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No classes scheduled</p>
                        ) : (
                          <div className="space-y-2">
                            {groupSchedule
                              .sort((a, b) => {
                                const dayCompare = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
                                return dayCompare !== 0 ? dayCompare : a.startTime.localeCompare(b.startTime)
                              })
                              .map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold">{entry.course}</div>
                                    <div className="text-xs text-muted-foreground">{entry.room}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {entry.teacher} | {entry.day} {entry.startTime}-{entry.endTime}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{schedule.length}</div>
                <div className="text-sm text-muted-foreground">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{rooms.length}</div>
                <div className="text-sm text-muted-foreground">Rooms Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{groups.length}</div>
                <div className="text-sm text-muted-foreground">Groups Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {daysOrder.filter((d) => groupedByDay.has(d)).length}
                </div>
                <div className="text-sm text-muted-foreground">Days Used</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
