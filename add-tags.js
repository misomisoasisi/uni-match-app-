const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const takuya = await prisma.user.findFirst({ where: { name: 'Takuya' } });
    if (takuya) {
      await prisma.user.update({
        where: { id: takuya.id },
        data: { tags: takuya.tags + ', アニメ, あつ森, アウトドア' }
      });
    }

    const saki = await prisma.user.findFirst({ where: { name: 'Saki' } });
    if (saki) {
      await prisma.user.update({
        where: { id: saki.id },
        data: { tags: saki.tags + ', アイドル, ANYCOLOR, あと少し' }
      });
    }
    console.log('Tags added successfully.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
