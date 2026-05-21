"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function login(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set('auth_user_id', userId.toString(), {
    httpOnly: true,
    secure: false, // IPアドレスアクセスなどのため、開発・テスト中はfalseを推奨
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1週間有効にする
  });
}

export async function loginWithEmail(email: string, pass: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'メールアドレスまたはパスワードが間違っています。' };
  }
  
  const isValid = await bcrypt.compare(pass, user.password);
  if (!isValid) {
    return { error: 'メールアドレスまたはパスワードが間違っています。' };
  }

  await login(user.id);
  return { success: true };
}

export async function registerUser(data: { name: string, email: string, pass: string, dept: string, gender: string, tags: string }) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    return { error: 'このメールアドレスは既に登録されています。' };
  }

  const hashedPassword = await bcrypt.hash(data.pass, 10);
  
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      gender: data.gender,
      dept: data.dept,
      char: '新入生',
      tags: data.tags || '設定なし',
      color: '#f8fafc',
      feature: ''
    }
  });

  await login(newUser.id);
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_user_id');
}

export async function loginAsGuest() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const email = `guest_${suffix}@example.com`;
  const name = `ゲスト${suffix}`;
  const pass = `guest_pass`;
  
  const hashedPassword = await bcrypt.hash(pass, 10);
  
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      gender: Math.random() > 0.5 ? '男性' : '女性',
      dept: 'ゲスト学部 1年',
      char: 'お試しゲスト',
      tags: '初心者',
      color: '#f3f4f6',
      feature: JSON.stringify({ top: 'shortFlat', clothing: 'hoodie', skinColor: 'ffdbb4' })
    }
  });

  await login(newUser.id);
  return { success: true };
}
export async function updateProfile(userId: number, data: {
  name: string;
  dept: string;
  tags: string;
  color: string;
  feature: string;
}) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      dept: data.dept,
      tags: data.tags,
      color: data.color,
      feature: data.feature,
    }
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/matches");
}

export async function createTextbook(sellerId: number, data: {
  title: string;
  className: string;
  price: string;
  note: string;
}) {
  await prisma.textbook.create({
    data: {
      ...data,
      sellerId
    }
  });
  revalidatePath("/textbooks");
  revalidatePath("/");
}

export async function createOrGetChatRoom(buyerId: number, sellerId: number, textbookId: number) {
  let room = await prisma.chatRoom.findFirst({
    where: { buyerId, sellerId, textbookId }
  });

  if (!room) {
    room = await prisma.chatRoom.create({
      data: { buyerId, sellerId, textbookId }
    });
  }

  return room.id;
}

export async function sendMessage(roomId: number, senderId: number, content: string) {
  await prisma.message.create({
    data: { roomId, senderId, content }
  });

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (room) {
    const recipientId = room.buyerId === senderId ? room.sellerId : room.buyerId;
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (sender) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'NEW_MESSAGE',
          content: `${sender.name}さんから新しいメッセージが届きました。`,
          link: `/chat/${roomId}`
        }
      });
    }
  }

  revalidatePath(`/chat/${roomId}`);
}

export async function createGathering(creatorId: number, data: {
  title: string;
  date: string;
  place: string;
  type: string;
  tags: string;
  deadline?: string;
}) {
  const { deadline, ...rest } = data;
  await prisma.gathering.create({
    data: {
      ...rest,
      creatorId: creatorId,
      deadline: (deadline && deadline.trim() !== '') ? new Date(deadline) : null,
      members: {
        connect: { id: creatorId }
      }
    }
  });
  revalidatePath("/gatherings");
  revalidatePath("/");
}

export async function deleteGathering(gatheringId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  const gathering = await prisma.gathering.findUnique({
    where: { id: gatheringId },
    include: { members: true }
  });

  if (!gathering) throw new Error("Gathering not found");

  const isCreator = gathering.creatorId === userId || (gathering.members[0] && gathering.members[0].id === userId);
  if (!isCreator) throw new Error("Only the creator can delete this gathering");

  await prisma.gathering.delete({
    where: { id: gatheringId }
  });

  revalidatePath("/gatherings");
  revalidatePath("/");
}

export async function joinGathering(userId: number, gatheringId: number) {
  const gathering = await prisma.gathering.findUnique({
    where: { id: gatheringId },
    include: { members: true }
  });

  await prisma.gathering.update({
    where: { id: gatheringId },
    data: {
      members: {
        connect: { id: userId }
      }
    }
  });

  if (gathering && gathering.members.length > 0) {
    const creator = gathering.members[0];
    const joiner = await prisma.user.findUnique({ where: { id: userId }});
    if (creator.id !== userId && joiner) {
      await prisma.notification.create({
        data: {
          userId: creator.id,
          type: 'GATHERING_JOIN',
          content: `${joiner.name}さんがあなたの募集「${gathering.title}」に参加しました！`,
          link: `/gatherings`
        }
      });
    }
  }

  revalidatePath("/gatherings");
  revalidatePath("/");
}

export async function leaveGathering(userId: number, gatheringId: number) {
  await prisma.gathering.update({
    where: { id: gatheringId },
    data: {
      members: {
        disconnect: { id: userId }
      }
    }
  });
  revalidatePath("/gatherings");
  revalidatePath("/");
}

export async function createOrGetMatchChatRoom(user1Id: number, user2Id: number) {
  // IDを常に同じ順序（buyerId < sellerId）にして重複ルームを防ぐ
  const buyerId = Math.min(user1Id, user2Id);
  const sellerId = Math.max(user1Id, user2Id);

  let room = await prisma.chatRoom.findFirst({
    where: { 
      buyerId, 
      sellerId, 
      textbookId: null // 教科書関連でない通常チャット
    }
  });

  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        buyerId,
        sellerId,
        textbookId: null
      }
    });
  }

  return room.id;
}

export async function getMyUnreadCount() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return 0;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return 0;
  return await prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationsAsRead() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
  revalidatePath('/notifications');
}
