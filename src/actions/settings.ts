"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ActionState, BudgetSchema, CategorySchema, fieldErrors } from "@/lib/definitions";

export async function saveBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();
  const parsed = BudgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    monthlyLimit: formData.get("monthlyLimit"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { categoryId, monthlyLimit } = parsed.data;
  await prisma.budget.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId, monthlyLimit },
    update: { monthlyLimit },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Presupuesto guardado." };
}

export async function deleteBudget(formData: FormData) {
  const { userId } = await verifySession();
  await prisma.budget.deleteMany({ where: { id: String(formData.get("id")), userId } });
  revalidatePath("/", "layout");
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    group: formData.get("group"),
    type: formData.get("type"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await prisma.category.create({ data: { ...parsed.data, userId } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Categoría creada." };
}

export async function deleteCategory(formData: FormData) {
  const { userId } = await verifySession();
  const id = String(formData.get("id"));
  const used = await prisma.transaction.count({ where: { categoryId: id, userId } });
  if (used > 0) return; // no se borran categorías con movimientos
  await prisma.category.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await verifySession();
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD");
  const income = Number(formData.get("monthlyIncome") || 0);
  if (name.length < 2) return { errors: { name: ["Mínimo 2 caracteres."] } };
  await prisma.user.update({
    where: { id: userId },
    data: { name, currency, monthlyIncome: income > 0 ? income : null },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfil actualizado." };
}
