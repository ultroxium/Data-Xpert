import { cookies } from 'next/headers';

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    return token;
  }

  return null;
}