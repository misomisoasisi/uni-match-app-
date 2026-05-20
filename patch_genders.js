const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { name: 'Takuya' },
    data: { gender: '男性' }
  });
  await prisma.user.updateMany({
    where: { name: 'Saki' },
    data: { gender: '女性' }
  });
  await prisma.user.updateMany({
    where: { name: 'Kenji' },
    data: { gender: '男性' }
  });
  console.log("Genders updated!");
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
