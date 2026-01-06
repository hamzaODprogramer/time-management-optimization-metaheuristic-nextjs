"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Room {
  id: number
  name: string
  capacity: number
  type: string
}

const roomTypes = ["Amphi", "Large", "Small"]

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    type: "Small",
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/rooms/${editingId}` : "/api/rooms"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          capacity: Number.parseInt(formData.capacity),
          type: formData.type,
        }),
      })

      if (response.ok) {
        setFormData({ name: "", capacity: "", type: "Small" })
        setEditingId(null)
        setShowForm(false)
        fetchRooms()
      }
    } catch (error) {
      console.error("Error saving room:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/rooms/${id}`, { method: "DELETE" })
      fetchRooms()
    } catch (error) {
      console.error("Error deleting room:", error)
    }
  }

  const handleEdit = (room: Room) => {
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      type: room.type,
    })
    setEditingId(room.id)
    setShowForm(true)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
            <p className="text-muted-foreground mt-1">Manage classroom and facilities</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Room"}</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Room" : "Add New Room"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Room Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., A1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g., 400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Room
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
            {rooms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No rooms found. Create your first room!
                </CardContent>
              </Card>
            ) : (
              rooms.map((room) => (
                <Card key={room.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {room.name}
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">{room.type}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Capacity: {room.capacity} students</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="bg-transparent">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
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
