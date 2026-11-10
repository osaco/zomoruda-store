"use client";

import Link from "next/link";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold">حدث خطأ غير متوقع</h1>
      <p className="text-muted">جرّبي مرة أخرى، أو تواصلي معنا على واتساب.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-primary">إعادة المحاولة</button>
        <Link href="/" className="btn-secondary">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
