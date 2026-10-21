import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import { prisma } from "./prisma";

/**
 * Capa de acceso a datos (DAL): verifica la sesión antes de cualquier consulta.
 * `cache` evita repetir la verificación dentro de un mismo render.
 */
export const verifySession = cache(async () => {
  const session = await readSession();
  if (!session?.userId) redirect("/login");
  return { userId: session.userId };
});

export const getCurrentUser = cache(async () => {
  const { userId } = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      currency: true,
      monthlyIncome: true,
      dailyLimit: true,
      weeklyLimit: true,
      monthlyLimit: true,
      score: true,
      badges: true,
      completedLessons: true,
      seniorId: true,
    },
  });
  if (!user) redirect("/login");
  return {
    ...user,
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    dailyLimit: user.dailyLimit ? Number(user.dailyLimit) : null,
    weeklyLimit: user.weeklyLimit ? Number(user.weeklyLimit) : null,
    monthlyLimit: user.monthlyLimit ? Number(user.monthlyLimit) : null,
  };
});

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;
