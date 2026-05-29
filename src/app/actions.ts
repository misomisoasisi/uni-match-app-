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

// 簡易性格診断アルゴリズム
function calculateChar(tags: string): string {
  const t = tags || "";
  if (t.includes("インドア派") || t.includes("アニメ") || t.includes("ゲーム") || t.includes("読書")) {
    return "おだやか文化系";
  }
  if (t.includes("アウトドア派") || t.includes("スポーツ観戦") || t.includes("ドライブ") || t.includes("フェス好き")) {
    return "アクティブ行動派";
  }
  if (t.includes("カフェ巡り") || t.includes("旅行") || t.includes("ショッピング")) {
    return "トレンドウォッチャー";
  }
  if (t.includes("ぼっち回避") || t.includes("寂しがりや")) {
    return "フレンドリー寂しがり";
  }
  if (t.includes("フル単目指す") || t.includes("図書館の民")) {
    return "真面目な努力家";
  }
  return "マイペース学生";
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
      char: calculateChar(data.tags),
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
  bio?: string;
}) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      dept: data.dept,
      char: calculateChar(data.tags),
      tags: data.tags,
      color: data.color,
      feature: data.feature,
      bio: data.bio,
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

  const isCreator = gathering.creatorId === userId || (gathering.members[0] && gathering.members[0].id === userId) || gathering.creatorId === null;
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

export async function getCurrentUserFlags() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return null;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasAgreedToTerms: true, hasSeenTutorial: true }
  });
  return user;
}

export async function agreeToTerms() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return;

  await prisma.user.update({
    where: { id: userId },
    data: { hasAgreedToTerms: true }
  });
}

export async function completeTutorial() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return;

  await prisma.user.update({
    where: { id: userId },
    data: { hasSeenTutorial: true }
  });
}

export async function deleteTextbook(textbookId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  const textbook = await prisma.textbook.findUnique({
    where: { id: textbookId }
  });

  if (!textbook) throw new Error("Textbook not found");
  if (textbook.sellerId !== userId) {
    throw new Error("Only the seller can delete this textbook");
  }

  // Related chat rooms should set their textbookId to null
  await prisma.chatRoom.updateMany({
    where: { textbookId },
    data: { textbookId: null }
  });

  await prisma.textbook.delete({
    where: { id: textbookId }
  });

  revalidatePath("/textbooks");
  revalidatePath("/");
}

export async function getChatMessages(roomId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  // Room verification
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { buyerId: true, sellerId: true }
  });

  if (!room) throw new Error("Chat room not found");
  if (room.buyerId !== userId && room.sellerId !== userId) {
    throw new Error("Unauthorized access to chat room");
  }

  return await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' }
  });
}

export async function generateMeetToken() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  const token = globalThis.crypto.randomUUID().replace(/-/g, '');
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分間有効

  await prisma.user.update({
    where: { id: userId },
    data: {
      meetToken: token,
      meetTokenExpires: expires
    }
  });

  return token;
}

async function getMeetsCountForUser(userId: number) {
  return await prisma.meet.count({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    }
  });
}

export async function getMyMeetsCount() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return 0;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return 0;

  return await getMeetsCountForUser(userId);
}

export async function recordMeet(token: string, hostUserId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  if (userId === hostUserId) {
    return { error: "自分自身との出会いは記録できません。" };
  }

  // ホストユーザーを取得してトークンと期限を検証
  const host = await prisma.user.findUnique({
    where: { id: hostUserId },
    select: { id: true, name: true, meetToken: true, meetTokenExpires: true }
  });

  if (!host) {
    return { error: "相手のユーザーが見つかりません。" };
  }

  if (!host.meetToken || host.meetToken !== token) {
    return { error: "QRコードが無効か、またはすでに使用されています。相手にQRコードを再表示してもらってください。" };
  }

  if (host.meetTokenExpires && new Date() > host.meetTokenExpires) {
    return { error: "QRコードの有効期限が切れています。相手にQRコードを再表示してもらってください。" };
  }

  // トークンのワンタイム化（使い捨て）
  await prisma.user.update({
    where: { id: hostUserId },
    data: { meetToken: null, meetTokenExpires: null }
  });

  // IDの昇順で並び替えて登録
  const user1Id = Math.min(userId, hostUserId);
  const user2Id = Math.max(userId, hostUserId);

  const existingMeet = await prisma.meet.findUnique({
    where: {
      user1Id_user2Id: { user1Id, user2Id }
    }
  });

  let isFirstMeet = false;
  if (!existingMeet) {
    await prisma.meet.create({
      data: { user1Id, user2Id }
    });
    isFirstMeet = true;
    
    // お互いに通知を追加
    const guestUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    if (guestUser) {
      await prisma.notification.create({
        data: {
          userId: hostUserId,
          type: 'MEET_SUCCESS',
          content: `${guestUser.name}さんと出会いました！🤝`,
          link: '/profile'
        }
      });
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'MEET_SUCCESS',
          content: `${host.name}さんと出会いました！🤝`,
          link: '/profile'
        }
      });
    }
  }

  // トロフィー獲得判定
  const meetsCount = await getMeetsCountForUser(userId);

  const checkTrophy = (count: number) => {
    if (count === 1) return "ファーストコンタクト 🥉";
    if (count === 5) return "キャンパスの社交家 🥈";
    if (count === 10) return "うにばのスター 🥇";
    if (count === 20) return "レジェンド・オブ・うにば 🏆";
    return null;
  };

  const myTrophy = checkTrophy(meetsCount);

  revalidatePath("/profile");
  revalidatePath("/");

  return { 
    success: true, 
    partnerName: host.name, 
    newTrophy: isFirstMeet ? myTrophy : null,
    isFirstMeet
  };
}

export async function getChatRooms() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  const unreadNotifications = await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      type: 'NEW_MESSAGE'
    }
  });

  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    },
    include: {
      buyer: true,
      seller: true,
      textbook: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return rooms.map(room => {
    const partner = room.buyerId === userId ? room.seller : room.buyer;
    const lastMessage = room.messages[0] || null;
    const unreadCount = unreadNotifications.filter(n => n.link === `/chat/${room.id}`).length;
    return {
      id: room.id,
      partner: {
        id: partner.id,
        name: partner.name,
        color: partner.color,
        feature: partner.feature,
        dept: partner.dept
      },
      textbook: room.textbook ? {
        id: room.textbook.id,
        title: room.textbook.title
      } : null,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt
      } : null,
      unreadCount,
      updatedAt: room.updatedAt
    };
  });
}

export async function markRoomNotificationsAsRead(roomId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return;
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return;

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      type: 'NEW_MESSAGE',
      link: `/chat/${roomId}`
    },
    data: { isRead: true }
  });
  revalidatePath('/notifications');
  revalidatePath(`/chat/${roomId}`);
  revalidatePath('/chat');
}

// ==============================
// タイムライン (Post)
// ==============================
export async function createPost(content: string) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  await prisma.post.create({
    data: {
      content,
      authorId: userId
    }
  });
  revalidatePath("/");
}

export async function deletePost(postId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post?.authorId === userId) {
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
  }
}

// ==============================
// いいね機能 (Like)
// ==============================
export async function sendLike(receiverId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const senderId = parseInt(authCookie.value);
  if (isNaN(senderId)) throw new Error("Unauthorized");

  if (senderId === receiverId) return { error: "自分には送れません" };

  try {
    await prisma.like.create({
      data: { senderId, receiverId }
    });

    // 相手がすでに自分にいいねしているかチェック（マッチング成立）
    const reverseLike = await prisma.like.findUnique({
      where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } }
    });

    const sender = await prisma.user.findUnique({ where: { id: senderId } });

    if (reverseLike) {
      // マッチング成立
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MATCH',
          content: `${sender?.name}さんとマッチングしました！チャットを始めましょう🎉`,
          link: `/profile/${senderId}`
        }
      });
      await prisma.notification.create({
        data: {
          userId: senderId,
          type: 'MATCH',
          content: `気になっていたユーザーとマッチングしました！🎉`,
          link: `/profile/${receiverId}`
        }
      });
      revalidatePath(`/profile/${receiverId}`);
      return { success: true, isMatch: true };
    } else {
      // ただのいいね送信
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'LIKE',
          content: `${sender?.name}さんがあなたを気になっています👋`,
          link: `/profile/${senderId}`
        }
      });
      revalidatePath(`/profile/${receiverId}`);
      return { success: true, isMatch: false };
    }
  } catch (e) {
    return { error: "すでにいいねを送信済みです" };
  }
}

export async function checkMatchStatus(otherUserId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) return { hasLiked: false, isMatch: false };
  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) return { hasLiked: false, isMatch: false };

  const myLike = await prisma.like.findUnique({
    where: { senderId_receiverId: { senderId: userId, receiverId: otherUserId } }
  });

  const theirLike = await prisma.like.findUnique({
    where: { senderId_receiverId: { senderId: otherUserId, receiverId: userId } }
  });

  return {
    hasLiked: !!myLike,
    isMatch: !!myLike && !!theirLike
  };
}

// ==============================
// 安全性 (Block / Report)
// ==============================
export async function blockUser(blockedId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const blockerId = parseInt(authCookie.value);
  if (isNaN(blockerId)) throw new Error("Unauthorized");

  if (blockerId === blockedId) return { error: "自分をブロックすることはできません" };

  try {
    await prisma.block.create({
      data: { blockerId, blockedId }
    });
    revalidatePath("/");
    revalidatePath(`/profile/${blockedId}`);
    return { success: true };
  } catch (e) {
    return { error: "すでにブロックしています" };
  }
}

export async function reportUser(reportedId: number, reason: string) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const reporterId = parseInt(authCookie.value);
  if (isNaN(reporterId)) throw new Error("Unauthorized");

  await prisma.report.create({
    data: { reporterId, reportedId, reason }
  });
  
  return { success: true };
}

export async function getBlockedUsers() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const blockerId = parseInt(authCookie.value);
  if (isNaN(blockerId)) throw new Error("Unauthorized");

  const blocks = await prisma.block.findMany({
    where: { blockerId },
    include: {
      blocked: {
        select: {
          id: true,
          name: true,
          dept: true,
          color: true,
          feature: true
        }
      }
    }
  });

  return blocks.map(b => b.blocked);
}

export async function unblockUser(blockedId: number) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');
  if (!authCookie) throw new Error("Unauthorized");
  const blockerId = parseInt(authCookie.value);
  if (isNaN(blockerId)) throw new Error("Unauthorized");

  await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId,
        blockedId
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}
