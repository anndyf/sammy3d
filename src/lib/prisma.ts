import { PrismaClient } from '@prisma/client'

//Singleton for Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

// Forçando recarregamento temporário se já existia (truque para desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = new PrismaClient()
}

