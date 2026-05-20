import prisma from "@/lib/prisma";
import ChatUI from "./ChatUI";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const currentUserId = await getCurrentUserId();
  
  const resolvedParams = await params;
  const roomId = parseInt(resolvedParams.roomId);
  if (isNaN(roomId)) return notFound();

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      buyer: true,
      seller: true,
      textbook: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!room) return notFound();

  // 自分が出品者でも購入者でもない場合はエラー（今回は簡易実装のため特に表示せず進行）
  
  return <ChatUI room={room} currentUserId={currentUserId} />;
}
