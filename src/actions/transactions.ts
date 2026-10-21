"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { parseISODate } from "@/lib/dates";
import { ActionState, TransactionSchema, fieldErrors } from "@/lib/definitions";

export async function saveTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();

  const parsed = TransactionSchema.safeParse({
    id: formData.get("id") || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    paymentMethod: formData.get("paymentMethod"),
    isRecurring: formData.get("isRecurring") === "on",
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    notes: (formData.get("notes") as string) || undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { id, date, ...data } = parsed.data;

  // La categoría debe ser global o del propio usuario
  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, OR: [{ userId: null }, { userId }] },
  });
  if (!category) return { errors: { categoryId: ["Categoría no válida."] } };

  const payload = { ...data, date: parseISODate(date), notes: data.notes ?? null };

  if (id) {
    const { count } = await prisma.transaction.updateMany({ where: { id, userId }, data: payload });
    if (count === 0) return { message: "Movimiento no encontrado." };
  } else {
    await prisma.transaction.create({ data: { ...payload, userId } });
  }

  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Movimiento actualizado." : "Movimiento registrado." };
}

export async function deleteTransaction(formData: FormData) {
  const { userId } = await verifySession();
  const id = String(formData.get("id"));
  await prisma.transaction.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
