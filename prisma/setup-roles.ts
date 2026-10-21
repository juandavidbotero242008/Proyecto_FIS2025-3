import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Setting up Senior and Junior test profiles...");

  // 1. Asegurar usuario Senior (demo@behu.app)
  const senior = await prisma.user.update({
    where: { email: "demo@behu.app" },
    data: {
      role: "SENIOR",
      score: 88,
    },
  });

  // 2. Asegurar usuario Junior (estudiante@prueba.com) vinculado al Senior
  const junior = await prisma.user.update({
    where: { email: "estudiante@prueba.com" },
    data: {
      role: "JUNIOR",
      seniorId: senior.id,
      dailyLimit: 40,
      weeklyLimit: 200,
      monthlyLimit: 750,
      score: 82,
      badges: ["Ahorrador Novato", "Presupuesto Bajo Control"],
      completedLessons: ["intro-50-30-20"],
    },
  });

  console.log(`✓ Senior Configurado: ${senior.name} (${senior.email}) - Rol: ${senior.role}`);
  console.log(`✓ Junior Configurado: ${junior.name} (${junior.email}) - Rol: ${junior.role}, Acudiente: ${senior.name}`);
  console.log(`✓ Límites Junior: Diario $${junior.dailyLimit}, Semanal $${junior.weeklyLimit}, Mensual $${junior.monthlyLimit}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
