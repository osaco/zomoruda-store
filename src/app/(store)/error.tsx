"use client";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold">حدث خطأ غير متوقع</h1>
      <p className="text-muted">جرّبي مرة أخرى، أو تواصلي معنا على واتساب.</p>
      <button type="button" onClick={reset} className="btn-primary">إعادة المحاولة</button>
    </div>
  );
}
