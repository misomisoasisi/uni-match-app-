import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_user_id');

  if (!authCookie || !authCookie.value) {
    redirect('/login');
  }

  const userId = parseInt(authCookie.value);
  if (isNaN(userId)) {
    redirect('/login');
  }

  return userId;
}
