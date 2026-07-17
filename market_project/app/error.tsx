'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the console for now — swap this for a real error-tracking
    // service (e.g. Sentry) once one is wired up.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-bg px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-semibold text-text-primary mb-3">
          რაღაც არასწორად წავიდა
        </h1>
        <p className="text-text-muted mb-8">
          ბოდიშს გიხდით უხერხულობისთვის — გვერდზე მოულოდნელი შეცდომა
          მოხდა. სცადეთ თავიდან, ან დაბრუნდით მთავარ გვერდზე.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-full px-6 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
          >
            თავიდან ცდა
          </button>
          <a
            href="/"
            className="rounded-full px-6 py-3 border border-border-subtle bg-white text-text-primary font-medium hover:border-vip-border hover:text-vip-text transition-all"
          >
            მთავარ გვერდზე დაბრუნება
          </a>
        </div>
      </div>
    </div>
  );
}