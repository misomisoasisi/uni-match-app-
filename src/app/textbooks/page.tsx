import prisma from "@/lib/prisma";
import TextbookMarket from "./TextbookMarket";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function TextbooksPage() {
  const currentUserId = await getCurrentUserId();

  const textbooks = await prisma.textbook.findMany({
    include: { seller: true },
    orderBy: { createdAt: 'desc' }
  });

  return <TextbookMarket textbooks={textbooks} currentUserId={currentUserId} />;
}
