import prisma from "./src/lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(`Fetched ${users.length} users.`);
    for (const u of users) {
      console.log(`ID: ${u.id}, Name: ${u.name}, Tags: ${JSON.stringify(u.tags)} (Type: ${typeof u.tags})`);
    }
  } catch (e) {
    console.error("Error fetching users:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
