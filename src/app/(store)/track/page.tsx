import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusTimeline } from "@/features/orders/components/StatusTimeline";
import { findOrderForTracking } from "@/features/orders/server/queries";

export const metadata: Metadata = { title: "تتبّع الطلب" };
export const dynamic = "force-dynamic";

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string; phone?: string }> }) {
  const { order: number = "", phone = "" } = await searchParams;
  const order = number && phone ? await findOrderForTracking(number, phone) : null;

  return (
    <>
      <PageHeader title="تتبّع الطلب" description="أدخلي رقم الطلب ورقم الجوال المستخدم في الطلب" />
      <div className="container-page max-w-xl space-y-6 py-6">
        <form className="card space-y-3 p-5" method="get">
          <input name="order" defaultValue={number} required placeholder="رقم الطلب ZM-1234" dir="ltr" aria-label="رقم الطلب" className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm uppercase" />
          <input name="phone" defaultValue={phone} required type="tel" placeholder="059xxxxxxx" dir="ltr" aria-label="رقم الجوال" className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm" />
          <button className="btn-primary w-full">تتبّع</button>
        </form>
        {number && phone && !order && <p role="alert" className="card p-5 text-center text-danger">لم نجد طلباً بهذه البيانات</p>}
        {order && (
          <section className="card space-y-4 p-5">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-primary" dir="ltr">{order.orderNumber}</span>
              <span className="text-muted">{formatDate(order.createdAt)}</span>
            </div>
            <StatusTimeline order={order} />
            <ul className="space-y-1 border-t border-primary/10 pt-3 text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between"><span>{item.nameAr} × {item.quantity}</span><span>{formatPrice(item.lineTotal)}</span></li>
              ))}
              <li className="flex justify-between pt-2 font-bold"><span>الإجمالي</span><span>{formatPrice(order.total)}</span></li>
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
