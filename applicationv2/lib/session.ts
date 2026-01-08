import { cookies } from "next/headers"
import type { User } from "./auth"

const SESSION_COOKIE_NAME = "user_session"

export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionData) return null
    return JSON.parse(sessionData) as User
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
