"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { ActionState, LoginSchema, RegisterSchema, fieldErrors } from "@/lib/definitions";

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const income = formData.get("monthlyIncome");
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
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
      currency,
      monthlyIncome,
      passwordHash: await bcrypt.hash(password, 10),
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
