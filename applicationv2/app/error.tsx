"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">{error.message || "An unexpected error occurred"}</p>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  )
}
