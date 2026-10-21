/**
 * Utilidades de fechas.
 * Las fechas de calendario (transacciones, metas) se guardan como `DATE` y Prisma
 * las devuelve como medianoche UTC. Por eso todas las operaciones se hacen en UTC.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Hoy (fecha local del equipo) representado como medianoche UTC */
export function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY);
}

/** Lunes de la semana de `d` */
export function startOfWeek(d: Date): Date {
  const dow = (d.getUTCDay() + 6) % 7; // 0 = lunes
  return addDays(d, -dow);
}

export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function startOfNextMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function daysInMonth(d: Date): number {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
