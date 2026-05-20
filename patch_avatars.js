const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { name: 'Takuya' },
    data: { 
      feature: JSON.stringify({ top: 'shortHairShortFlat', clothing: 'hoodie', skinColor: 'pale' })
    }
  });
  
  await prisma.user.updateMany({
    where: { name: 'Saki' },
    data: { 
      feature: JSON.stringify({ top: 'longHairStraight', clothing: 'shirtCrewNeck', skinColor: 'light' })
    }
  });
  
  await prisma.user.updateMany({
    where: { name: 'Kenji' },
    data: { 
      feature: JSON.stringify({ top: 'shortHairTheCaesar', accessories: 'prescription02', clothing: 'blazerAndShirt', skinColor: 'brown' })
    }
  });

  console.log("Avatars updated!");
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
