"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Course {
  id: number
  name: string
  group: string
  teacher?: string
  minCapacity: number
  preferredRoomType: string
}

interface Group {
  id: number
  name: string
}

interface Teacher {
  id: number
  name: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    groupId: "",
    teacherId: "",
    minCapacity: "",
    preferredRoomType: "Small",
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, groupsRes, teachersRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/groups"),
        fetch("/api/teachers"),
      ])

      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (groupsRes.ok) setGroups(await groupsRes.json())
      if (teachersRes.ok) setTeachers(await teachersRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/courses/${editingId}` : "/api/courses"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          groupId: Number.parseInt(formData.groupId),
          teacherId: formData.teacherId ? Number.parseInt(formData.teacherId) : null,
          minCapacity: Number.parseInt(formData.minCapacity),
          preferredRoomType: formData.preferredRoomType,
        }),
      })

      if (response.ok) {
        setFormData({
          name: "",
          groupId: "",
          teacherId: "",
          minCapacity: "",
          preferredRoomType: "Small",
        })
        setEditingId(null)
        setShowForm(false)
        fetchData()
      }
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  const handleEdit = (course: Course) => {
    const group = groups.find((g) => g.name === course.group)
    setFormData({
      name: course.name,
      groupId: group?.id.toString() || "",
      teacherId: "",
      minCapacity: course.minCapacity.toString(),
      preferredRoomType: course.preferredRoomType,
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Manage courses and classes</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Course"}</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Course" : "Add New Course"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Course name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupId">Group</Label>
                    <select
                      id="groupId"
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    >
                      <option value="">Select a group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="teacherId">Teacher (Optional)</Label>
                    <select
                      id="teacherId"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">None</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minCapacity">Min Capacity</Label>
                    <Input
                      id="minCapacity"
                      type="number"
                      value={formData.minCapacity}
                      onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value })}
                      placeholder="e.g., 48"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomType">Preferred Room Type</Label>
                    <select
                      id="roomType"
                      value={formData.preferredRoomType}
                      onChange={(e) => setFormData({ ...formData, preferredRoomType: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="Small">Small</option>
                      <option value="Large">Large</option>
                      <option value="Amphi">Amphi</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Course
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No courses found. Create your first course!
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{course.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Group: {course.group}</span>
                        {course.teacher && <span>Teacher: {course.teacher}</span>}
                        <span>Min: {course.minCapacity}</span>
                        <span>{course.preferredRoomType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(course)} className="bg-transparent">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
