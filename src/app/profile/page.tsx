import prisma from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import SettingsSection from "./SettingsSection";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const currentUserId = await getCurrentUserId();

  const myUser = await prisma.user.findUnique({
    where: { id: currentUserId }
  });

  if (!myUser) {
    const { redirect } = await import("next/navigation");
    redirect('/login');
  }

  const meetsCount = await prisma.meet.count({
    where: {
      OR: [
        { user1Id: currentUserId },
        { user2Id: currentUserId }
      ]
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
      <ProfileForm initialProfile={myUser} meetsCount={meetsCount} />
      <SettingsSection />
    </div>
  );
}
