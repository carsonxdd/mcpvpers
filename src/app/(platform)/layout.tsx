import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/session';
import { signOut } from '@/lib/auth';

// Slim chrome for platform pages (login, dashboard, get-started) — distinct
// from both the pvpers site Header and tenant site headers.
export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 t-surface backdrop-blur border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/get-started" className="font-pixel text-xs text-gold">
            Server Sites
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="font-pixel text-[10px] t-text hover:text-gold">
                  Dashboard
                </Link>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/login' });
                  }}
                >
                  <button
                    type="submit"
                    className="font-pixel text-[10px] t-text-muted hover:text-gold cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="font-pixel text-[10px] t-text hover:text-gold">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="relative z-20 flex-1 pt-14">{children}</main>
    </>
  );
}
