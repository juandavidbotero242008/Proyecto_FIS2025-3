"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { ActionState, LoginSchema, RegisterSchema, fieldErrors } from "@/lib/definitions";

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const income = formData.get("monthlyIncome");
  const role = (formData.get("role") as "SENIOR" | "JUNIOR") || "SENIOR";
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role,
    currency: formData.get("currency") || "USD",
    monthlyIncome: income ? income : undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { name, email, password, currency, monthlyIncome } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { errors: { email: ["Ya existe una cuenta con este email."] } };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: parsed.data.role,
      currency,
      monthlyIncome,
      passwordHash: await bcrypt.hash(password, 10),
      score: 75,
      // Límites por defecto si se registra como Junior independiente
      dailyLimit: parsed.data.role === "JUNIOR" ? 50 : null,
      weeklyLimit: parsed.data.role === "JUNIOR" ? 250 : null,
      monthlyLimit: parsed.data.role === "JUNIOR" ? 1000 : null,
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !valid) return { message: "Email o contraseña incorrectos." };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
