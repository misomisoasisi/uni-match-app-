const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    const users = await prisma.user.findMany({ select: { name: true, tags: true } });
    console.log('User tags:');
    users.forEach(u => console.log(`- ${u.name}: ${u.tags}`));
    console.log('Notification count:', notificationCount);
    console.log('DB Check: OK');
  } catch (e) {
    console.error('DB Check: FAILED');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
