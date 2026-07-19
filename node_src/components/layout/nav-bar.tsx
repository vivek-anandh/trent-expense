'use client';

import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white px-4 shadow-sm sm:px-5 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-brand to-purple-600" />
          Expenses
        </span>

        {/* desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
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

        {/* hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center rounded-lg p-2 text-ink-soft hover:bg-gray-100 sm:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* mobile dropdown */}
      {open && (
        <div className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink-soft hover:bg-gray-100',
              )}
            >
              {link.label}
            </Link>
          ))}
          {auth.isAuthenticated && (
            <>
              <div className="border-t border-gray-100 pt-2 mt-1">
                <span className="block px-3 text-xs text-ink-faint">
                  {getUsername(auth.user)}
                </span>
              </div>
              <button
                onClick={() => auth.signoutRedirect()}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-gray-100"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
