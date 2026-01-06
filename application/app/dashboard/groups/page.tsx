"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Group {
  id: number
  name: string
  size: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", size: "" })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/groups/${editingId}` : "/api/groups"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          size: Number.parseInt(formData.size),
        }),
      })

      if (response.ok) {
        setFormData({ name: "", size: "" })
        setEditingId(null)
        setShowForm(false)
        fetchGroups()
      }
    } catch (error) {
      console.error("Error saving group:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/groups/${id}`, { method: "DELETE" })
      fetchGroups()
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }

  const handleEdit = (group: Group) => {
    setFormData({ name: group.name, size: group.size.toString() })
    setEditingId(group.id)
    setShowForm(true)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Groups</h1>
            <p className="text-muted-foreground mt-1">Manage student groups and classes</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Group"}</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Group" : "Add New Group"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., TC S1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Group Size</Label>
                    <Input
                      id="size"
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g., 50"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Group
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
            {groups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No groups found. Create your first group!
                </CardContent>
              </Card>
            ) : (
              groups.map((group) => (
                <Card key={group.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.size} students</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(group)} className="bg-transparent">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(group.id)}>
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
