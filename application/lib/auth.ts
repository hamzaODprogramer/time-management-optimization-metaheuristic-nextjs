import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name,
      role: "admin",
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  if (!isPasswordValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}
