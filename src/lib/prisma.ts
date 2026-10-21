import { PrismaClient } from "@prisma/client";

// Reutiliza una sola instancia de Prisma en desarrollo (evita agotar conexiones con el hot-reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
