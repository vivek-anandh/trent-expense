'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import clsx from 'clsx';

const links = [
  { href: '/masters', label: 'Masters' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/capture', label: 'Add Expense' },
];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]!;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getUsername(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return '';

  // 1. Decode access_token — Cognito always puts "username" there
  const atPayload = decodeJwtPayload(user.access_token ?? '');
  const fromAT = atPayload?.username;
  if (typeof fromAT === 'string' && fromAT) return fromAT;

  // 2. Decode id_token if present
  const idPayload = decodeJwtPayload(user.id_token ?? '');
  const fromID = idPayload?.username;
  if (typeof fromID === 'string' && fromID) return fromID;

  // 3. Try profile (may or may not have it)
  const fromProfile = user.profile.preferred_username ?? user.profile.username;
  if (typeof fromProfile === 'string' && fromProfile) return fromProfile;

  // 4. Last resort
  return user.profile.sub ?? '';
}

export function NavBar() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-brand to-purple-600" />
          Expenses
        </span>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink-soft hover:bg-brand-soft hover:text-brand',
              )}
            >
              {link.label}
            </Link>
          ))}
          {auth.isAuthenticated && (
            <>
              <span className="ml-2 text-xs text-ink-faint">
                {getUsername(auth.user)}
              </span>
              <button
                onClick={() => auth.signoutRedirect()}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-gray-100"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
