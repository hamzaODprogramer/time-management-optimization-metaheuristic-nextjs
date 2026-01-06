"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function OptimizeButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ message: string; count: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/optimize", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Optimization failed")
        return
      }

      setResult({
        message: data.message,
        count: data.scheduleCount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleOptimize} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Optimizing Schedule..." : "Generate Optimized Schedule"}
      </Button>

      {result && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary font-medium">{result.message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
