import prisma from "@/lib/prisma";
import MatchFeed from "./MatchFeed";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const currentUserId = await getCurrentUserId();

  const users = await prisma.user.findMany();

  return <MatchFeed users={users} currentUserId={currentUserId} />;
}
