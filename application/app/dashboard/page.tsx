"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OptimizeButton } from "@/components/optimize-button"
import { VerificationPanel } from "@/components/verification-panel"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalGroups: 0,
    totalRooms: 0,
    totalTeachers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your schedule management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Active courses in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalGroups}</div>
              <p className="text-xs text-muted-foreground mt-1">Student groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground mt-1">Available classrooms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground mt-1">Teaching staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Generate Optimized Schedule</CardTitle>
              <CardDescription>Run the optimization algorithm to create an optimal timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizeButton />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Current Schedule</CardTitle>
              <CardDescription>Check the current week's timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/dashboard/schedule">
                <button className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-foreground text-sm font-medium">
                  View Schedule
                </button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Verification Panel */}
        <VerificationPanel />
      </div>
    </div>
  )
}
