import { getCurrentUserId } from "@/lib/auth";
import { getChatRooms } from "../actions";
import ChatListClient from "./ChatListClient";

export const dynamic = 'force-dynamic';

export default async function ChatListPage() {
  const currentUserId = await getCurrentUserId();
  const rooms = await getChatRooms();

  return <ChatListClient initialRooms={rooms} currentUserId={currentUserId} />;
}
