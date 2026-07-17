export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-border-subtle border-t-vip-border animate-spin" />
        <p className="text-text-muted text-sm">იტვირთება...</p>
      </div>
    </div>
  );
}