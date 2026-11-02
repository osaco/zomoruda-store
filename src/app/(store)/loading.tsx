export default function Loading() {
  return (
    <div className="container-page grid grid-cols-2 gap-3 py-8 md:grid-cols-4" aria-busy="true" aria-label="جاري التحميل">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-card bg-primary-light" />
      ))}
    </div>
  );
}
