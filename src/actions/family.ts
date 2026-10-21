"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { ActionState, AssignBudgetSchema, LinkJuniorSchema, fieldErrors } from "@/lib/definitions";

export async function linkJunior(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const senior = await getCurrentUser();
  if (senior.role !== "SENIOR") {
    return { message: "Solo los usuarios Senior pueden vincular cuentas Junior." };
  }

  const parsed = LinkJuniorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    initialBudget: formData.get("initialBudget") || 0,
    dailyLimit: formData.get("dailyLimit") || undefined,
    weeklyLimit: formData.get("weeklyLimit") || undefined,
    monthlyLimit: formData.get("monthlyLimit") || undefined,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { name, email, password, initialBudget, dailyLimit, weeklyLimit, monthlyLimit } = parsed.data;

  // Verificar si ya existe usuario con este email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.seniorId) {
      return { errors: { email: ["Esta cuenta ya está vinculada a otro acudiente."] } };
    }
    // Si ya existe pero no tiene acudiente, vincularlo y convertirlo a JUNIOR
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "JUNIOR",
        seniorId: senior.id,
        dailyLimit: dailyLimit ?? existing.dailyLimit,
        weeklyLimit: weeklyLimit ?? existing.weeklyLimit,
        monthlyLimit: monthlyLimit ?? existing.monthlyLimit,
      },
    });

    if (initialBudget > 0) {
      await transferBudget(senior.id, senior.name, existing.id, existing.name, initialBudget);
    }

    revalidatePath("/family");
    revalidatePath("/dashboard");
    return { ok: true, message: `Cuenta de ${name} vinculada exitosamente.` };
  }

  // Crear nueva cuenta Junior
  const passwordHash = await bcrypt.hash(password, 10);
  const newJunior = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "JUNIOR",
      seniorId: senior.id,
      currency: senior.currency,
      dailyLimit: dailyLimit ?? 50,
      weeklyLimit: weeklyLimit ?? 200,
      monthlyLimit: monthlyLimit ?? 600,
      score: 80,
    },
  });

  // Si tiene presupuesto inicial, descontar del Senior y acreditar al Junior (HU-02)
  if (initialBudget > 0) {
    await transferBudget(senior.id, senior.name, newJunior.id, newJunior.name, initialBudget);
  }

  revalidatePath("/family");
  revalidatePath("/dashboard");
  return { ok: true, message: `Cuenta Junior para ${name} creada y vinculada con éxito.` };
}

export async function assignBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const senior = await getCurrentUser();
  if (senior.role !== "SENIOR") {
    return { message: "Acción permitida únicamente a usuarios Senior." };
  }

  const parsed = AssignBudgetSchema.safeParse({
    juniorId: formData.get("juniorId"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { juniorId, amount, note } = parsed.data;

  const junior = await prisma.user.findFirst({
    where: { id: juniorId, seniorId: senior.id },
  });

  if (!junior) {
    return { message: "Cuenta Junior no encontrada o no vinculada a ti." };
  }

  await transferBudget(senior.id, senior.name, junior.id, junior.name, amount, note);

  revalidatePath("/family");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { ok: true, message: `Presupuesto de $${amount} asignado exitosamente a ${junior.name}.` };
}

export async function unlinkJunior(juniorId: string) {
  const senior = await getCurrentUser();
  if (senior.role !== "SENIOR") throw new Error("No autorizado");

  const junior = await prisma.user.findFirst({
    where: { id: juniorId, seniorId: senior.id },
  });

  if (!junior) throw new Error("Cuenta Junior no encontrada");

  // Desvincular de la cuenta familiar (HU-03)
  await prisma.user.update({
    where: { id: juniorId },
    data: { seniorId: null },
  });

  revalidatePath("/family");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateJuniorLimits(formData: FormData) {
  const senior = await getCurrentUser();
  if (senior.role !== "SENIOR") throw new Error("No autorizado");

  const juniorId = String(formData.get("juniorId"));
  const dailyLimit = Number(formData.get("dailyLimit")) || null;
  const weeklyLimit = Number(formData.get("weeklyLimit")) || null;
  const monthlyLimit = Number(formData.get("monthlyLimit")) || null;

  await prisma.user.updateMany({
    where: { id: juniorId, seniorId: senior.id },
    data: {
      dailyLimit,
      weeklyLimit,
      monthlyLimit,
    },
  });

  revalidatePath("/family");
  return { ok: true };
}

/**
 * Función auxiliar para transferir presupuesto dejando registros explícitos (HU-02)
 */
async function transferBudget(
  seniorId: string,
  seniorName: string,
  juniorId: string,
  juniorName: string,
  amount: number,
  note?: string
) {
  const now = new Date();

  // Categoría por defecto para transferencias familiares
  let familyCategory = await prisma.category.findFirst({
    where: { name: { contains: "Familia", mode: "insensitive" } },
  });

  if (!familyCategory) {
    familyCategory = await prisma.category.create({
      data: {
        name: "Familia y Mesada",
        color: "#3b82f6",
        icon: "Users",
        group: "NEED",
        type: "EXPENSE",
      },
    });
  }

  // 1. Descuento del saldo principal del Senior (EXPENSE)
  await prisma.transaction.create({
    data: {
      userId: seniorId,
      categoryId: familyCategory.id,
      type: "EXPENSE",
      amount,
      date: now,
      description: `Asignación de presupuesto a ${juniorName}${note ? ` (${note})` : ""}`,
      paymentMethod: "TRANSFER",
      relatedUserId: juniorId,
    },
  });

  // 2. Acreditación al saldo de la cuenta Junior (INCOME)
  await prisma.transaction.create({
    data: {
      userId: juniorId,
      categoryId: familyCategory.id,
      type: "INCOME",
      amount,
      date: now,
      description: `Presupuesto asignado por acudiente ${seniorName}${note ? ` (${note})` : ""}`,
      paymentMethod: "TRANSFER",
      relatedUserId: seniorId,
    },
  });
}
