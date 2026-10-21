import * as z from "zod";

/** Estado genérico que devuelven las Server Actions usadas con useActionState */
export type ActionState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }
  | undefined;

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Mínimo 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." }),
  role: z.enum(["SENIOR", "JUNIOR"]).default("SENIOR"),
  currency: z.string().length(3).default("USD"),
  monthlyIncome: z.coerce.number().min(0).optional(),
});

export const LinkJuniorSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  password: z.string().min(6, { error: "Mínimo 6 caracteres." }),
  initialBudget: z.coerce.number().min(0, { error: "El presupuesto no puede ser negativo." }),
  dailyLimit: z.coerce.number().min(0).optional(),
  weeklyLimit: z.coerce.number().min(0).optional(),
  monthlyLimit: z.coerce.number().min(0).optional(),
});

export const AssignBudgetSchema = z.object({
  juniorId: z.string().min(1, { error: "Selecciona una cuenta Junior." }),
  amount: z.coerce.number().positive({ error: "El monto debe ser mayor que 0." }),
  note: z.string().trim().max(120).optional(),
});

export const LoginSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Introduce tu contraseña." }),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Fecha inválida." });

export const TransactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.coerce.number().positive({ error: "El monto debe ser mayor que 0." }),
  date: isoDate,
  description: z.string().trim().min(1, { error: "Añade una descripción." }).max(120),
  categoryId: z.string().min(1, { error: "Elige una categoría." }),
  paymentMethod: z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "TRANSFER", "OTHER"]),
  isRecurring: z.boolean(),
  isImpulsive: z.boolean().optional(),
  tags: z.array(z.string()),
  notes: z.string().trim().max(500).optional(),
});

export const GoalSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, { error: "Ponle un nombre a tu meta." }).max(60),
  emoji: z.string().trim().min(1).max(8),
  targetAmount: z.coerce.number().positive({ error: "El objetivo debe ser mayor que 0." }),
  deadline: isoDate.optional().or(z.literal("")),
});

export const ContributionSchema = z.object({
  goalId: z.string().min(1),
  amount: z.coerce.number().refine((v) => v !== 0, { error: "El monto no puede ser 0." }),
  date: isoDate,
  note: z.string().trim().max(120).optional(),
});

export const BudgetSchema = z.object({
  categoryId: z.string().min(1, { error: "Elige una categoría." }),
  monthlyLimit: z.coerce.number().positive({ error: "El límite debe ser mayor que 0." }),
});

export const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "Mínimo 2 caracteres." }).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Color inválido." }),
  icon: z.string().min(1),
  group: z.enum(["NEED", "WANT", "SAVING", "INCOME"]),
  type: z.enum(["EXPENSE", "INCOME"]),
});

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
