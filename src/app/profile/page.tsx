import prisma from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import LogoutButton from "./LogoutButton";
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

  return (
    <>
      <ProfileForm initialProfile={myUser} />
      <LogoutButton />
    </>
  );
}
