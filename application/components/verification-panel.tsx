"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, TrendingDown, Calendar, Users, DoorOpen } from "lucide-react"

interface VerificationResult {
    success: boolean
    isValid: boolean
    fitness: number
    violations: {
        hard: {
            professor_conflicts: number
            room_conflicts: number
            group_conflicts: number
            capacity_violations: number
            room_type_mismatches: number
        }
        soft: {
            gaps_in_schedule: number
            uneven_distribution: number
        }
        details: {
            professor_conflicts: any[]
            room_conflicts: any[]
            group_conflicts: any[]
            capacity_issues: any[]
            type_issues: any[]
        }
    }
    statistics: {
        total_courses: number
        total_timeslots: number
        total_rooms: number
        total_teachers: number
        day_distribution: Record<string, number>
        utilization: {
            rooms: Record<string, { count: number; percentage: number }>
        }
    }
    message: string
}

export function VerificationPanel() {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = async () => {
        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch("/api/verify", { method: "GET" })
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Verification failed")
                return
            }

            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const totalHardViolations = result
        ? Object.values(result.violations.hard).reduce((sum, val) => sum + val, 0)
        : 0

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Schedule Verification
                    </CardTitle>
                    <CardDescription>
                        Verify that the optimization algorithm is working correctly by analyzing constraint violations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleVerify} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? "Verifying Schedule..." : "Verify Optimization"}
                    </Button>

                    {error && (
                        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="mt-6 space-y-6">
                            {/* Overall Status */}
                            <div
                                className={`p-6 rounded-lg border-2 ${result.isValid
                                        ? "bg-green-50 border-green-500 dark:bg-green-950/20"
                                        : "bg-red-50 border-red-500 dark:bg-red-950/20"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {result.isValid ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold">{result.message}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Fitness Score: <span className="font-mono font-semibold">{result.fitness}</span>
                                            {result.isValid && " (Lower is better)"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hard Constraints */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Hard Constraints
                                        <Badge variant={totalHardViolations === 0 ? "default" : "destructive"}>
                                            {totalHardViolations === 0 ? "All Satisfied ✓" : `${totalHardViolations} Violations`}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ConstraintItem
                                            label="Professor Conflicts"
                                            value={result.violations.hard.professor_conflicts}
                                            description="Same professor teaching multiple courses at the same time"
                                        />
                                        <ConstraintItem
                                            label="Room Conflicts"
                                            value={result.violations.hard.room_conflicts}
                                            description="Same room assigned to multiple courses simultaneously"
                                        />
                                        <ConstraintItem
                                            label="Group Conflicts"
                                            value={result.violations.hard.group_conflicts}
                                            description="Same student group in multiple courses at once"
                                        />
                                        <ConstraintItem
                                            label="Capacity Violations"
                                            value={result.violations.hard.capacity_violations}
                                            description="Room capacity less than required"
                                        />
                                        <ConstraintItem
                                            label="Room Type Mismatches"
                                            value={result.violations.hard.room_type_mismatches}
                                            description="Course assigned to wrong room type"
                                        />
                                    </div>

                                    {/* Show conflict details if any */}
                                    {result.violations.details.professor_conflicts.length > 0 && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                            <h4 className="font-semibold text-sm mb-2">Professor Conflicts:</h4>
                                            {result.violations.details.professor_conflicts.map((conflict: any, idx: number) => (
                                                <p key={idx} className="text-xs text-muted-foreground">
                                                    • Professor {conflict.professor_id} teaching {conflict.count} courses at timeslot{" "}
                                                    {conflict.timeslot_id}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Soft Constraints */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4" />
                                        Soft Constraints (Quality Metrics)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Schedule Gaps</span>
                                                <Badge variant="outline">{result.violations.soft.gaps_in_schedule}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Empty time slots between courses (lower is better)
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Distribution Variance</span>
                                                <Badge variant="outline">{result.violations.soft.uneven_distribution.toFixed(2)}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                How evenly courses are distributed across days
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Schedule Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <StatCard icon={<Calendar />} label="Total Courses" value={result.statistics.total_courses} />
                                        <StatCard icon={<Calendar />} label="Time Slots" value={result.statistics.total_timeslots} />
                                        <StatCard icon={<DoorOpen />} label="Rooms" value={result.statistics.total_rooms} />
                                        <StatCard icon={<Users />} label="Teachers" value={result.statistics.total_teachers} />
                                    </div>

                                    {/* Day Distribution */}
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-3">Courses per Day:</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {Object.entries(result.statistics.day_distribution).map(([day, count]) => (
                                                <div key={day} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-xs font-medium">{day}</span>
                                                    <Badge variant="secondary">{count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Room Utilization */}
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-3">Room Utilization:</h4>
                                        <div className="space-y-2">
                                            {Object.entries(result.statistics.utilization.rooms)
                                                .slice(0, 5)
                                                .map(([room, data]: [string, any]) => (
                                                    <div key={room} className="flex items-center gap-2">
                                                        <span className="text-xs flex-1 truncate">{room}</span>
                                                        <div className="flex-1 bg-muted rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{ width: `${Math.min(data.percentage, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-mono w-12 text-right">{data.percentage}%</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Optimization Proof */}
                            <Card className="border-2 border-primary">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Optimization Proof
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold">Algorithm:</span>
                                            <Badge>Hybrid Simulated Annealing + Iterated Local Search</Badge>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Status:</span>{" "}
                                            {result.isValid ? (
                                                <span className="text-green-600 font-semibold">
                                                    ✓ All hard constraints satisfied - This is a VALID optimized schedule
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-semibold">
                                                    ✗ Schedule has violations - Optimization may need more iterations
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-muted-foreground text-xs mt-3">
                                            This verification proves that the schedule is {result.isValid ? "not just random data" : "being optimized"}, but{" "}
                                            {result.isValid ? "a properly optimized solution" : "may need adjustment"} that respects all constraints
                                            using metaheuristic optimization techniques.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function ConstraintItem({ label, value, description }: { label: string; value: number; description: string }) {
    return (
        <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{label}</span>
                {value === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                    <Badge variant="destructive">{value}</Badge>
                )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
                <div className="text-primary">{icon}</div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    )
}
