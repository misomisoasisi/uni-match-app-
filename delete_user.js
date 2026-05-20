const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: { 
      email: { 
        notIn: ['takuya@example.com', 'saki@example.com', 'kenji@example.com'] 
      } 
    }
  });
  console.log(`Deleted ${result.count} users.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
