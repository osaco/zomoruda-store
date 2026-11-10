import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="font-heading text-6xl font-bold text-primary/30">404</p>
      <h1 className="font-heading text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="text-sm text-muted">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link href="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );
}
