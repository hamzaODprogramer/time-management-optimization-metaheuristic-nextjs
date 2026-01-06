import { type NextRequest, NextResponse } from "next/server"
import { authenticate } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await authenticate(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    await createSession(user)

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
