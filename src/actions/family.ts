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

  const mode = formData.get("mode") === "CREATE_NEW" ? "CREATE_NEW" : "LINK_EXISTING";

  const parsed = LinkJuniorSchema.safeParse({
    mode,
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    password: formData.get("password") || undefined,
    initialBudget: formData.get("initialBudget") || 0,
    dailyLimit: formData.get("dailyLimit") || undefined,
    weeklyLimit: formData.get("weeklyLimit") || undefined,
    monthlyLimit: formData.get("monthlyLimit") || undefined,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { email, name, password, initialBudget, dailyLimit, weeklyLimit, monthlyLimit } = parsed.data;

  // 1. Verificar si ya existe usuario con este email
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // REGLA 1: Blindaje contra secuestro de cuentas Senior independientes
    if (existing.role === "SENIOR") {
      return {
        errors: {
          email: ["Esta cuenta pertenece a un usuario Senior independiente y no puede ser vinculada como dependiente."],
        },
      };
    }

    // REGLA 2: No permitir vincular un Junior que ya pertenece a otro núcleo familiar
    if (existing.seniorId) {
      if (existing.seniorId === senior.id) {
        return { errors: { email: ["Este usuario Junior ya forma parte de tu grupo familiar."] } };
      }
      return { errors: { email: ["Esta cuenta Junior ya está vinculada a otro acudiente."] } };
    }

    // REGLA 3: Es una cuenta Junior existente sin acudiente -> Enviar solicitud
    const pendingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        seniorId: senior.id,
        juniorId: existing.id,
        status: "PENDING",
      },
    });

    if (pendingInvitation) {
      return {
        message: `Ya enviaste una solicitud de vinculación a ${existing.name}. El usuario debe aceptarla desde su panel.`,
      };
    }

    await prisma.familyInvitation.create({
      data: {
        seniorId: senior.id,
        juniorId: existing.id,
        initialBudget,
        dailyLimit: dailyLimit ?? undefined,
        weeklyLimit: weeklyLimit ?? undefined,
        monthlyLimit: monthlyLimit ?? undefined,
        status: "PENDING",
      },
    });

    revalidatePath("/family");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: `Solicitud de vinculación enviada a ${existing.name}. Se vinculará cuando el usuario acepte la invitación en su cuenta.`,
    };
  }

  // 2. Si el correo NO existe en la base de datos:
  // Si venimos del modo vinculación simple, le indicamos que la cuenta no existe y le damos la opción de crearla
  if (mode !== "CREATE_NEW") {
    return {
      ok: false,
      message: "NOT_FOUND", // Flag especial para que la UI le pregunte si desea crear la cuenta desde cero
    };
  }

  // Si confirmó el modo CREATE_NEW: validamos que haya ingresado nombre y contraseña
  if (!name || name.length < 2) {
    return { errors: { name: ["El nombre debe tener al menos 2 caracteres para crear la cuenta."] } };
  }
  if (!password || password.length < 6) {
    return { errors: { password: ["La contraseña debe tener al menos 6 caracteres."] } };
  }

  // Crear nueva cuenta Junior desde cero
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

  // Si tiene presupuesto inicial, descontar del Senior y acreditar al Junior
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
 * Aceptar invitación familiar (Acción ejecutada por el usuario Junior)
 */
export async function acceptFamilyInvitation(invitationId: string) {
  const junior = await getCurrentUser();
  if (junior.role !== "JUNIOR") {
    return { ok: false, message: "Solo un usuario Junior puede responder a esta solicitud." };
  }

  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
    include: { senior: true },
  });

  if (!invitation || invitation.juniorId !== junior.id || invitation.status !== "PENDING") {
    return { ok: false, message: "La invitación no es válida o ya fue procesada." };
  }

  // 1. Vincular el Junior con el Senior y configurar los límites pactados
  await prisma.user.update({
    where: { id: junior.id },
    data: {
      seniorId: invitation.seniorId,
      dailyLimit: invitation.dailyLimit ?? junior.dailyLimit,
      weeklyLimit: invitation.weeklyLimit ?? junior.weeklyLimit,
      monthlyLimit: invitation.monthlyLimit ?? junior.monthlyLimit,
    },
  });

  // 2. Marcar invitación como aceptada
  await prisma.familyInvitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  // 3. Si tenía presupuesto inicial prometido, transferirlo ahora que aceptó
  const initialBudgetNum = Number(invitation.initialBudget);
  if (initialBudgetNum > 0) {
    await transferBudget(
      invitation.seniorId,
      invitation.senior.name,
      junior.id,
      junior.name,
      initialBudgetNum,
      "Aceptación de vinculación familiar"
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/family");
  return { ok: true, message: `Te has unido al grupo familiar de ${invitation.senior.name}.` };
}

/**
 * Rechazar invitación familiar (Acción ejecutada por el usuario Junior)
 */
export async function rejectFamilyInvitation(invitationId: string) {
  const junior = await getCurrentUser();
  if (junior.role !== "JUNIOR") {
    return { ok: false, message: "Solo un usuario Junior puede responder a esta solicitud." };
  }

  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.juniorId !== junior.id || invitation.status !== "PENDING") {
    return { ok: false, message: "La invitación no es válida o ya fue procesada." };
  }

  await prisma.familyInvitation.update({
    where: { id: invitation.id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "Has rechazado la solicitud de vinculación." };
}

/**
 * Cancelar invitación enviada (Acción ejecutada por el usuario Senior)
 */
export async function cancelFamilyInvitation(invitationId: string) {
  const senior = await getCurrentUser();
  if (senior.role !== "SENIOR") {
    return { ok: false, message: "No autorizado." };
  }

  await prisma.familyInvitation.deleteMany({
    where: { id: invitationId, seniorId: senior.id, status: "PENDING" },
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
