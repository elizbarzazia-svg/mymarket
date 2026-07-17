import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-bg px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🛍️</div>
        <h1 className="text-3xl font-semibold text-text-primary mb-3">
          გვერდი ვერ მოიძებნა
        </h1>
        <p className="text-text-muted mb-8">
          სამწუხაროდ, ეს გვერდი აღარ არსებობს ან გადატანილია. შეამოწმეთ
          მისამართი, ან დაბრუნდით მთავარ გვერდზე.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full px-6 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
          >
            მთავარ გვერდზე დაბრუნება
          </Link>
          <Link
            href="/buyer"
            className="rounded-full px-6 py-3 border border-border-subtle bg-white text-text-primary font-medium hover:border-vip-border hover:text-vip-text transition-all"
          >
            ნივთების დათვალიერება
          </Link>
        </div>
      </div>
    </div>
  );
}