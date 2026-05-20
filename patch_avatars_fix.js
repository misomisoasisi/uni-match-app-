const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { name: 'Takuya' },
    data: { 
      feature: JSON.stringify({ top: 'shortFlat', clothing: 'hoodie', skinColor: 'edb98a' })
    }
  });
  
  await prisma.user.updateMany({
    where: { name: 'Saki' },
    data: { 
      feature: JSON.stringify({ top: 'straight01', clothing: 'shirtCrewNeck', skinColor: 'ffdbb4' })
    }
  });
  
  await prisma.user.updateMany({
    where: { name: 'Kenji' },
    data: { 
      feature: JSON.stringify({ top: 'curly', accessories: 'round', clothing: 'blazerAndShirt', skinColor: 'ae5d29' })
    }
  });

  console.log("Avatars fixed!");
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
