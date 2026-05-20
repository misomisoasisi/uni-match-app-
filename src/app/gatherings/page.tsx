import prisma from "@/lib/prisma";
import GatheringFeed from "./GatheringFeed";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function GatheringsPage() {
  const currentUserId = await getCurrentUserId();

  const gatherings = await prisma.gathering.findMany({
    include: { members: true },
    orderBy: { createdAt: 'desc' }
  });

  return <GatheringFeed gatherings={gatherings} currentUserId={currentUserId} />;
}
