import prisma from "./src/lib/prisma";

async function main() {
  try {
    const gatherings = await prisma.gathering.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Fetched ${gatherings.length} gatherings.`);
    
    for (const g of gatherings) {
      console.log(`ID: ${g.id}`);
      console.log(`Title: ${g.title}`);
      console.log(`Date: ${JSON.stringify(g.date)} (Type: ${typeof g.date})`);
      console.log(`Deadline: ${JSON.stringify(g.deadline)} (Type: ${typeof g.deadline})`);
      console.log('---');
    }
  } catch (e) {
    console.error("Error fetching gatherings:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
