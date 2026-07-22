import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { getSessionUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Sign in | Server Sites',
  description: 'Sign in to create and manage your Minecraft server site.',
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect('/dashboard');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24">
      <div className="mc-panel w-full p-8 text-center">
        <h1 className="font-pixel text-lg text-gold">Sign in</h1>
        <p className="mt-4 text-sm opacity-80">
          Sign in with Discord to create and manage a site for your Minecraft
          server.
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('discord', { redirectTo: '/dashboard' });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="mc-pill inline-block w-full cursor-pointer px-6 py-3 font-pixel text-xs"
          >
            Sign in with Discord
          </button>
        </form>
      </div>
    </div>
  );
}
