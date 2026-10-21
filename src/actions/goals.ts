"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { parseISODate } from "@/lib/dates";
import { ActionState, ContributionSchema, GoalSchema, fieldErrors } from "@/lib/definitions";

export async function saveGoal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();
  const parsed = GoalSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    emoji: formData.get("emoji") || "🎯",
    targetAmount: formData.get("targetAmount"),
    deadline: formData.get("deadline") || "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { id, deadline, ...data } = parsed.data;
  const payload = { ...data, deadline: deadline ? parseISODate(deadline) : null };

  if (id) {
    await prisma.savingsGoal.updateMany({ where: { id, userId }, data: payload });
  } else {
    await prisma.savingsGoal.create({ data: { ...payload, userId } });
  }
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Meta actualizada." : "¡Meta creada!" };
}

export async function addContribution(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();
  const parsed = ContributionSchema.safeParse({
    goalId: formData.get("goalId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: (formData.get("note") as string) || undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const goal = await prisma.savingsGoal.findFirst({
    where: { id: parsed.data.goalId, userId },
    include: { contributions: true },
  });
  if (!goal) return { message: "Meta no encontrada." };

  await prisma.goalContribution.create({
    data: { ...parsed.data, date: parseISODate(parsed.data.date) },
  });

  // Marca la meta como completada si se alcanzó el objetivo
  const saved = goal.contributions.reduce((s, c) => s + Number(c.amount), 0) + parsed.data.amount;
  const status = saved >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";
  if (status !== goal.status) await prisma.savingsGoal.update({ where: { id: goal.id }, data: { status } });

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: status === "COMPLETED" ? "🎉 ¡Felicidades, alcanzaste tu meta!" : "Aporte registrado.",
  };
}

export async function deleteGoal(formData: FormData) {
  const { userId } = await verifySession();
  await prisma.savingsGoal.deleteMany({ where: { id: String(formData.get("id")), userId } });
  revalidatePath("/", "layout");
}
