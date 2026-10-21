import { PrismaClient, CategoryGroup, TransactionType, PaymentMethod, GoalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  // GASTOS - NECESIDADES (NEED)
  { name: "Alimentación y Supermercado", color: "#34e3a9", icon: "shopping-cart", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },
  { name: "Vivienda y Alquiler", color: "#60a5fa", icon: "home", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },
  { name: "Servicios Básicos (Luz, Agua, Net)", color: "#f59e0b", icon: "zap", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },
  { name: "Transporte Público y Combustible", color: "#38bdf8", icon: "bus", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },
  { name: "Salud y Farmacia", color: "#fb7185", icon: "heart-pulse", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },
  { name: "Educación y Universidad", color: "#818cf8", icon: "graduation-cap", group: CategoryGroup.NEED, type: TransactionType.EXPENSE },

  // GASTOS - DESEOS (WANT)
  { name: "Restaurantes y Cafeterías", color: "#f43f5e", icon: "utensils", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },
  { name: "Ocio, Cine y Salidas", color: "#a855f7", icon: "film", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },
  { name: "Ropa y Calzado", color: "#ec4899", icon: "shirt", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },
  { name: "Suscripciones (Netflix, Spotify)", color: "#c084fc", icon: "repeat", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },
  { name: "Gimnasio y Deporte", color: "#2dd4bf", icon: "dumbbell", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },
  { name: "Tecnología y Gadgets", color: "#3b82f6", icon: "laptop", group: CategoryGroup.WANT, type: TransactionType.EXPENSE },

  // GASTOS - AHORRO / INVERSIÓN (SAVING)
  { name: "Fondo de Emergencia", color: "#10b981", icon: "piggy-bank", group: CategoryGroup.SAVING, type: TransactionType.EXPENSE },
  { name: "Inversiones", color: "#06b6d4", icon: "landmark", group: CategoryGroup.SAVING, type: TransactionType.EXPENSE },

  // INGRESOS
  { name: "Salario o Nómina", color: "#22c55e", icon: "banknote", group: CategoryGroup.INCOME, type: TransactionType.INCOME },
  { name: "Trabajos Freelance", color: "#14b8a6", icon: "briefcase", group: CategoryGroup.INCOME, type: TransactionType.INCOME },
  { name: "Mesada o Apoyo Familiar", color: "#6366f1", icon: "wallet", group: CategoryGroup.INCOME, type: TransactionType.INCOME },
  { name: "Rendimientos o Inversiones", color: "#0ea5e9", icon: "coins", group: CategoryGroup.INCOME, type: TransactionType.INCOME },
];

const defaultTips = [
  {
    category: "Presupuesto",
    title: "La regla 50/30/20",
    body: "Divide tus ingresos netos en: 50 % para necesidades básicas (arriendo, servicios, comida), 30 % para deseos personales (ocio, restaurantes) y 20 % para ahorro y metas futuras.",
  },
  {
    category: "Ahorro",
    title: "Págate a ti primero",
    body: "No ahorres lo que te sobra después de gastar. En cuanto recibas tus ingresos, aparta inmediatamente el porcentaje destinado al ahorro.",
  },
  {
    category: "Seguridad",
    title: "Construye tu fondo de emergencia",
    body: "Tu primer objetivo financiero debe ser acumular el equivalente a 3 a 6 meses de gastos fijos en una cuenta segura y líquida para imprevistos.",
  },
  {
    category: "Hábitos",
    title: "Cuidado con los 'gastos hormiga'",
    body: "Un café diario de $3 o pequeñas golosinas suman más de $90 al mes ($1.080 al año). Identificarlos no significa eliminarlos todos, sino ser consciente de su impacto.",
  },
  {
    category: "Compras",
    title: "Aplica la regla de las 48 horas",
    body: "Antes de comprar algo no esencial que supere los $30, espera 48 horas. En la mayoría de los casos, el impulso emocional se habrá disipado.",
  },
  {
    category: "Deudas",
    title: "Usa la tarjeta de crédito a 1 sola cuota",
    body: "Trata la tarjeta de crédito como dinero en efectivo. Pagar todo a una cuota te da beneficios y millas sin pagar intereses abusivos.",
  },
];

async function main() {
  console.log("🌱 Iniciando seed de BeHu...");

  // 1. Crear categorías globales
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log("✓ Categorías globales listas.");

  // 2. Crear tips de educación financiera
  for (const tip of defaultTips) {
    const existing = await prisma.tip.findFirst({
      where: { title: tip.title },
    });
    if (!existing) {
      await prisma.tip.create({ data: tip });
    }
  }
  console.log("✓ Consejos financieros listos.");

  // 3. Crear usuario Demo
  const demoEmail = "demo@behu.app";
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  const hash = await bcrypt.hash("Demo1234", 10);
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Laura García",
        currency: "USD",
        monthlyIncome: 1200,
        passwordHash: hash,
      },
    });
    console.log("✓ Usuario demo creado (demo@behu.app / Demo1234).");
  }

  // Comprobar si ya tiene transacciones
  const txCount = await prisma.transaction.count({ where: { userId: demoUser.id } });
  if (txCount === 0) {
    const categories = await prisma.category.findMany({ where: { userId: null } });
    const getCatId = (name: string) => categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()))?.id || categories[0].id;

    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    // Ingresos del mes
    await prisma.transaction.createMany({
      data: [
        {
          userId: demoUser.id,
          categoryId: getCatId("Salario"),
          type: TransactionType.INCOME,
          amount: 1200,
          date: new Date(today.getTime() - 14 * dayMs),
          description: "Salario mensual trabajo medio tiempo",
          paymentMethod: PaymentMethod.TRANSFER,
          isRecurring: true,
          tags: ["salario", "empleo"],
        },
        {
          userId: demoUser.id,
          categoryId: getCatId("Freelance"),
          type: TransactionType.INCOME,
          amount: 150,
          date: new Date(today.getTime() - 4 * dayMs),
          description: "Diseño de infografía para cliente",
          paymentMethod: PaymentMethod.TRANSFER,
          isRecurring: false,
          tags: ["freelance"],
        },
      ],
    });

    // Gastos distribuidos en las últimas 3 semanas
    const sampleExpenses = [
      { cat: "Alquiler", amount: 350, daysAgo: 14, desc: "Aporte arriendo de habitación", method: PaymentMethod.TRANSFER, recur: true, tags: ["casa"] },
      { cat: "Servicios", amount: 45, daysAgo: 12, desc: "Pago servicio internet y móvil", method: PaymentMethod.DEBIT_CARD, recur: true, tags: ["fijo"] },
      { cat: "Alimentación", amount: 65.5, daysAgo: 10, desc: "Compras semanales supermercado", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["comida"] },
      { cat: "Transporte", amount: 20, daysAgo: 9, desc: "Recarga tarjeta transporte público", method: PaymentMethod.CASH, recur: false, tags: ["movilidad"] },
      { cat: "Restaurantes", amount: 28, daysAgo: 8, desc: "Almuerzo con compañeros de facultad", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["salida"] },
      { cat: "Suscripciones", amount: 12.99, daysAgo: 7, desc: "Spotify y YouTube Premium", method: PaymentMethod.CREDIT_CARD, recur: true, tags: ["streaming"] },
      { cat: "Alimentación", amount: 54.2, daysAgo: 5, desc: "Frutas, verduras y mercado", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["comida"] },
      { cat: "Transporte", amount: 15, daysAgo: 4, desc: "Viaje en taxi por lluvia", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["transporte"] },
      { cat: "Ocio", amount: 22, daysAgo: 3, desc: "Entrada a cine y palomitas", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["amigos"] },
      { cat: "Restaurantes", amount: 14.5, daysAgo: 2, desc: "Café de especialidad y snack", method: PaymentMethod.CASH, recur: false, tags: ["cafe"] },
      { cat: "Educación", amount: 35, daysAgo: 1, desc: "Libro de cálculo y papelería", method: PaymentMethod.DEBIT_CARD, recur: false, tags: ["facultad"] },
      { cat: "Alimentación", amount: 18.3, daysAgo: 0, desc: "Snacks y cena ligera", method: PaymentMethod.CASH, recur: false, tags: ["comida"] },
    ];

    for (const exp of sampleExpenses) {
      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          categoryId: getCatId(exp.cat),
          type: TransactionType.EXPENSE,
          amount: exp.amount,
          date: new Date(today.getTime() - exp.daysAgo * dayMs),
          description: exp.desc,
          paymentMethod: exp.method,
          isRecurring: exp.recur,
          tags: exp.tags,
        },
      });
    }
    console.log("✓ Transacciones de ejemplo creadas.");

    // Metas de ahorro
    const goal1 = await prisma.savingsGoal.create({
      data: {
        userId: demoUser.id,
        name: "Fondo de Emergencia",
        emoji: "🛡️",
        targetAmount: 800,
        deadline: new Date(today.getTime() + 90 * dayMs),
        status: GoalStatus.ACTIVE,
      },
    });

    await prisma.goalContribution.createMany({
      data: [
        { goalId: goal1.id, amount: 200, date: new Date(today.getTime() - 14 * dayMs), note: "Aporte inicial salario" },
        { goalId: goal1.id, amount: 100, date: new Date(today.getTime() - 4 * dayMs), note: "Aporte freelance" },
      ],
    });

    const goal2 = await prisma.savingsGoal.create({
      data: {
        userId: demoUser.id,
        name: "Viaje de Fin de Semestre",
        emoji: "✈️",
        targetAmount: 400,
        deadline: new Date(today.getTime() + 60 * dayMs),
        status: GoalStatus.ACTIVE,
      },
    });

    await prisma.goalContribution.create({
      data: {
        goalId: goal2.id,
        amount: 150,
        date: new Date(today.getTime() - 7 * dayMs),
        note: "Ahorro de salidas del fin de semana",
      },
    });
    console.log("✓ Metas de ahorro creadas con aportes.");

    // Presupuestos mensuales
    await prisma.budget.createMany({
      data: [
        { userId: demoUser.id, categoryId: getCatId("Alimentación"), monthlyLimit: 220 },
        { userId: demoUser.id, categoryId: getCatId("Restaurantes"), monthlyLimit: 80 },
        { userId: demoUser.id, categoryId: getCatId("Ocio"), monthlyLimit: 60 },
        { userId: demoUser.id, categoryId: getCatId("Transporte"), monthlyLimit: 70 },
      ],
    });
    console.log("✓ Presupuestos mensuales configurados.");
  }

  console.log("🎉 Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
