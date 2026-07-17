'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessages } from '@/lib/MessagesContext';

export default function MessagesLink() {
  const pathname = usePathname();
  const { unreadCount } = useMessages();
  const active = pathname === '/messages';

  return (
    <Link
      href="/messages"
      aria-label="შეტყობინებები"
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-150 ${
        active ? 'bg-card-hover' : 'hover:bg-card-hover'
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? '#a5760a' : '#1c1c1c'}
        strokeWidth={1.8}
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                     min-w-[18px] h-[18px] px-1 rounded-full
                     bg-vip-border text-[10px] font-semibold text-[#1c1c1c]
                     shadow-[0_0_0_2px_white]"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}