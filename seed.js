const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10);
  // Add initial user
  const user1 = await prisma.user.create({
    data: {
      name: 'Takuya',
      dept: '経済学部 2年',
      char: 'ENFP',
      tags: 'カフェ巡り, 映画鑑賞',
      color: '#e0f2fe',
      feature: '',
      email: 'takuya@example.com',
      password: defaultPassword
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Saki',
      dept: '文学部 1年',
      char: 'ISFJ',
      tags: '読書, 写真',
      color: '#ffe4e6',
      feature: '&hair=pixie',
      email: 'saki@example.com',
      password: defaultPassword
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Kenji',
      dept: '工学部 3年',
      char: 'INTP',
      tags: 'ゲーム, プログラミング',
      color: '#dcfce7',
      feature: '&glasses=round',
      email: 'kenji@example.com',
      password: defaultPassword
    }
  });

  // Add textbooks
  await prisma.textbook.create({
    data: {
      title: 'ミクロ経済学 第3版',
      className: '経済学基礎',
      price: '¥1,500',
      note: '書き込み少しあります。過去問のコツ教えます！',
      sellerId: user1.id
    }
  });

  await prisma.textbook.create({
    data: {
      title: '基礎線形代数',
      className: '線形代数I',
      price: '無料譲渡',
      note: 'もう使わないので差し上げます。',
      sellerId: user3.id
    }
  });

  // Add gatherings
  await prisma.gathering.create({
    data: {
      title: '【新入生歓迎】駅前のイタリアンでランチ🍽️',
      date: '今日 12:30',
      place: 'サイゼリヤ 駅前店',
      type: 'ご飯',
      tags: '気軽, 初対面歓迎, 女子多め',
      members: {
        connect: [{ id: user2.id }]
      }
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
