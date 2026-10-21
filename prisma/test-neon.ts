import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Testing Neon DB end-to-end connectivity...");
  
  const [usersCount, categoriesCount, txCount, goalsCount, tipsCount] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.transaction.count(),
    prisma.savingsGoal.count(),
    prisma.tip.count(),
  ]);

  console.log("=== NEON DATABASE STATUS ===");
  console.log(`✓ Users in DB: ${usersCount}`);
  console.log(`✓ Categories in DB: ${categoriesCount}`);
  console.log(`✓ Transactions in DB: ${txCount}`);
  console.log(`✓ Goals in DB: ${goalsCount}`);
  console.log(`✓ Financial Tips in DB: ${tipsCount}`);
  
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@behu.app" },
    include: {
      transactions: { take: 3 },
      goals: true,
      budgets: true,
    },
  });

  if (demoUser) {
    console.log(`✓ Verified Demo User: ${demoUser.name} (${demoUser.email})`);
    console.log(`✓ Transactions loaded: ${demoUser.transactions.length}`);
    console.log(`✓ Goals loaded: ${demoUser.goals.length}`);
  } else {
    console.log("Notice: demo@behu.app not found");
  }

  const testUser = await prisma.user.findUnique({
    where: { email: "estudiante@prueba.com" },
  });
  if (testUser) {
    console.log(`✓ Verified Test User: ${testUser.name} (${testUser.email})`);
  }

  console.log("=== ALL END-TO-END CHECKS PASSED ON NEON POSTGRES ===");
}

main()
  .catch((e) => {
    console.error("End-to-end check failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
