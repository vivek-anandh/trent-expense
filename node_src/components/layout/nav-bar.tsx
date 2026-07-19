'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import clsx from 'clsx';
import { getUsername } from '@/lib/auth-utils';

const links = [
  { href: '/capture', label: 'Add Expense' },
  { href: '/manage', label: 'Manage' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/masters', label: 'Masters' },
];

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
