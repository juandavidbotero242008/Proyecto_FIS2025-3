"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function claimLessonBadge(lessonId: string, badgeName: string) {
  const user = await getCurrentUser();

  const currentLessons = user.completedLessons || [];
  const currentBadges = user.badges || [];

  if (currentLessons.includes(lessonId)) {
    return { ok: true, message: "Lección ya completada previamente." };
  }

  const updatedLessons = [...currentLessons, lessonId];
  const updatedBadges = currentBadges.includes(badgeName) ? currentBadges : [...currentBadges, badgeName];
  const newScore = Math.min(100, (user.score || 75) + 5);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      completedLessons: updatedLessons,
      badges: updatedBadges,
      score: newScore,
    },
  });

  revalidatePath("/learn");
  revalidatePath("/dashboard");
  return { ok: true, badge: badgeName, score: newScore };
}
