import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      name: 'Takuya',
      email: 'takuya@example.com',
      password: hashed,
      dept: '工学部',
      char: 'INTJ',
      tags: 'プログラミング',
      color: '#ffb3ba',
      feature: '',
      gender: '男性'
    }
  });
  await prisma.user.create({
    data: {
      name: 'Saki',
      email: 'saki@example.com',
      password: hashed,
      dept: '文学部',
      char: 'ENFP',
      tags: '読書',
      color: '#baffc9',
      feature: '',
      gender: '女性'
    }
  });
  console.log('Seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
