"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Teacher {
  id: number
  name: string
  email?: string
  phone?: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: "", email: "", phone: "" })
        setEditingId(null)
        setShowForm(false)
        fetchTeachers()
      }
    } catch (error) {
      console.error("Error saving teacher:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/teachers/${id}`, { method: "DELETE" })
      fetchTeachers()
    } catch (error) {
      console.error("Error deleting teacher:", error)
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email || "",
      phone: teacher.phone || "",
    })
    setEditingId(teacher.id)
    setShowForm(true)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground mt-1">Manage teaching staff</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Teacher"}</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Teacher" : "Add New Teacher"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Teacher name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="teacher@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Teacher
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
            {teachers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No teachers found. Add your first teacher!
                </CardContent>
              </Card>
            ) : (
              teachers.map((teacher) => (
                <Card key={teacher.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                      {teacher.email && <p className="text-sm text-muted-foreground">{teacher.email}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(teacher)}
                        className="bg-transparent"
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(teacher.id)}>
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
