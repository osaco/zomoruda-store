import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-20 text-center">
      <p className="font-heading text-6xl font-bold text-primary/30">404</p>
      <h1 className="font-heading text-2xl font-bold">الصفحة غير موجودة</h1>
      <Link href="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );
}
