import { PrismaClient, TransactionType, PaymentMethod, GoalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const testEmail = "estudiante@prueba.com";
  const passwordPlain = "Prueba123";

  console.log(`Configurando usuario de prueba: ${testEmail}...`);

  // Eliminar si ya existía para tener datos frescos
  const existing = await prisma.user.findUnique({ where: { email: testEmail } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const hash = await bcrypt.hash(passwordPlain, 10);
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Juan Estudiante",
      currency: "USD",
      monthlyIncome: 1000,
      passwordHash: hash,
    },
  });

  const categories = await prisma.category.findMany({ where: { userId: null } });
  const getCatId = (keyword: string) =>
    categories.find((c) => c.name.toLowerCase().includes(keyword.toLowerCase()))?.id || categories[0].id;

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. Ingresos
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        categoryId: getCatId("Salario"),
        type: TransactionType.INCOME,
        amount: 850,
        date: new Date(now.getTime() - 12 * dayMs),
        description: "Beca / Trabajo medio tiempo",
        paymentMethod: PaymentMethod.TRANSFER,
        isRecurring: true,
        tags: ["ingreso", "fijo"],
      },
      {
        userId: user.id,
        categoryId: getCatId("Freelance"),
        type: TransactionType.INCOME,
        amount: 200,
        date: new Date(now.getTime() - 3 * dayMs),
        description: "Asesoría académica y tutoría",
        paymentMethod: PaymentMethod.TRANSFER,
        isRecurring: false,
        tags: ["extra"],
      },
    ],
  });

  // 2. Gastos realistas
  const expenses = [
    { cat: "Alquiler", amount: 300, daysAgo: 12, desc: "Pago habitación compartida", method: PaymentMethod.TRANSFER, recur: true, tags: ["arriendo"] },
    { cat: "Servicios", amount: 35, daysAgo: 10, desc: "Factura de luz e internet móvil", method: PaymentMethod.DEBIT_CARD, recur: true, tags: ["servicios"] },
    { cat: "Alimentación", amount: 55.4, daysAgo: 9, desc: "Mercado quincenal en supermercado", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["comida"] },
    { cat: "Transporte", amount: 18, daysAgo: 8, desc: "Recarga abono de bus y metro", method: PaymentMethod.CASH, recur: false, tags: ["transporte"] },
    { cat: "Restaurantes", amount: 22.5, daysAgo: 7, desc: "Almuerzo en cafetería del campus", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["amigos"] },
    { cat: "Educación", amount: 45, daysAgo: 6, desc: "Fotocopias y libros semestrales", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["universidad"] },
    { cat: "Suscripciones", amount: 9.99, daysAgo: 5, desc: "Suscripción Spotify para estudiantes", method: PaymentMethod.CREDIT_CARD, recur: true, tags: ["musica"] },
    { cat: "Alimentación", amount: 32.1, daysAgo: 4, desc: "Víveres y frutas de la semana", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["comida"] },
    { cat: "Ocio", amount: 25, daysAgo: 3, desc: "Entrada a cine y comida con amigos", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["salida"] },
    { cat: "Transporte", amount: 12, daysAgo: 2, desc: "Taxi por regreso nocturno de la facultad", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["movilidad"] },
    { cat: "Restaurantes", amount: 15.8, daysAgo: 1, desc: "Café y snacks en biblioteca", method: PaymentMethod.CASH, recur: false, tags: ["cafe"] },
    { cat: "Alimentación", amount: 14.2, daysAgo: 0, desc: "Cena rápida", method: PaymentMethod.CASH, recur: false, tags: ["comida"] },
  ];

  for (const exp of expenses) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: getCatId(exp.cat),
        type: TransactionType.EXPENSE,
        amount: exp.amount,
        date: new Date(now.getTime() - exp.daysAgo * dayMs),
        description: exp.desc,
        paymentMethod: exp.method,
        isRecurring: exp.recur,
        tags: exp.tags,
      },
    });
  }

  // 3. Metas de ahorro
  const goal1 = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Fondo de Emergencia Universitaria",
      emoji: "🛡️",
      targetAmount: 500,
      deadline: new Date(now.getTime() + 75 * dayMs),
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: goal1.id, amount: 120, date: new Date(now.getTime() - 10 * dayMs), note: "Primer aporte quincena" },
      { goalId: goal1.id, amount: 60, date: new Date(now.getTime() - 3 * dayMs), note: "Aporte de tutoría freelance" },
    ],
  });

  const goal2 = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Laptop nueva para el proyecto",
      emoji: "💻",
      targetAmount: 800,
      deadline: new Date(now.getTime() + 120 * dayMs),
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.goalContribution.create({
    data: {
      goalId: goal2.id,
      amount: 250,
      date: new Date(now.getTime() - 6 * dayMs),
      note: "Ahorro acumulado",
    },
  });

  // 4. Presupuestos mensuales
  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: getCatId("Alimentación"), monthlyLimit: 180 },
      { userId: user.id, categoryId: getCatId("Restaurantes"), monthlyLimit: 60 },
      { userId: user.id, categoryId: getCatId("Transporte"), monthlyLimit: 50 },
      { userId: user.id, categoryId: getCatId("Ocio"), monthlyLimit: 40 },
    ],
  });

  console.log(`✅ Usuario creado exitosamente con credenciales:`);
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${passwordPlain}`);
}

main()
  .catch((e) => {
    console.error("Error al crear usuario de prueba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
