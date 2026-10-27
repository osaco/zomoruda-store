import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getRepos } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { toInternational } from "@/lib/phone";
import { FULFILLMENT_LABELS_AR, ORDER_STATUS_LABELS_AR, ORDER_STATUS_VALUES, PAYMENT_METHOD_LABELS_AR } from "@/types/enums";
import { AdminPageTitle, inputCls } from "@/features/admin/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { StatusTimeline } from "@/features/orders/components/StatusTimeline";
import { updateOrderStatus } from "@/features/orders/server/admin-actions";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getRepos().orders.getById(id);
  if (!order) notFound();
  const waCustomer = `https://wa.me/${toInternational(order.customerPhone)}?text=${encodeURIComponent(`مرحباً ${order.customerName} 💜 بخصوص طلبك ${order.orderNumber} من زُمُرّدة:`)}`;

  return (
    <>
      <AdminPageTitle title={`الطلب ${order.orderNumber}`} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-heading font-bold">المنتجات</h2>
            <ul className="divide-y divide-primary/5">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-3 py-3">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" width={56} height={56} className="rounded-image" />}
                  <div className="flex-1 text-sm">
                    <p className="font-bold">{item.nameAr} × {item.quantity}</p>
                    {item.options.map((o) => <p key={o.nameAr} className="text-xs text-muted">{o.nameAr}: {o.valueAr}</p>)}
                    {item.customName && <p className="text-xs">الاسم: <strong>{item.customName}</strong></p>}
                    {item.cardMessage && <p className="text-xs">رسالة الكرت: {item.cardMessage}</p>}
                    {item.photoPath && <a href={`/admin/files?path=${encodeURIComponent(item.photoPath)}`} target="_blank" className="text-xs text-primary underline">عرض الصورة المطلوب طباعتها</a>}
                  </div>
                  <span className="font-bold">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-primary/10 pt-3 text-sm">
              <div className="flex justify-between"><dt>المجموع</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>التوصيل</dt><dd>{formatPrice(order.deliveryFee)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-success"><dt>خصم {order.couponCode}</dt><dd>-{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between font-bold text-primary"><dt>الإجمالي</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </section>
          <section className="card grid gap-3 p-5 text-sm sm:grid-cols-2">
            <p><span className="text-muted">الزبون: </span><Link href={`/admin/customers?q=${order.customerPhone}`} className="font-bold text-primary">{order.customerName}</Link></p>
            <p><span className="text-muted">الجوال: </span><span dir="ltr">{order.customerPhone}</span></p>
            <p><span className="text-muted">الاستلام: </span>{FULFILLMENT_LABELS_AR[order.fulfillment]} {order.zoneNameAr && `- ${order.zoneNameAr}`}</p>
            <p><span className="text-muted">العنوان: </span>{order.address ?? "—"}</p>
            <p><span className="text-muted">الموعد: </span>{order.deliveryDate ?? "—"} {order.timeSlot}</p>
            <p><span className="text-muted">الدفع: </span>{PAYMENT_METHOD_LABELS_AR[order.paymentMethod]}</p>
            {order.receiptPath && <p className="sm:col-span-2"><span className="text-muted">الإيصال: </span><a href={`/admin/files?path=${encodeURIComponent(order.receiptPath)}`} target="_blank" className="text-primary underline">عرض الإيصال</a></p>}
            {order.notes && <p className="sm:col-span-2"><span className="text-muted">ملاحظات: </span>{order.notes}</p>}
            <p className="text-muted sm:col-span-2">أُنشئ: {formatDate(order.createdAt, true)}</p>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="card space-y-4 p-5">
            <div className="flex items-center justify-between"><h2 className="font-heading font-bold">الحالة</h2><OrderStatusBadge status={order.status} /></div>
            <form action={updateOrderStatus} className="space-y-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className={inputCls} aria-label="الحالة الجديدة">
                {ORDER_STATUS_VALUES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS_AR[s]}</option>)}
              </select>
              <input name="note" placeholder="ملاحظة (اختياري)" className={inputCls} />
              <button className="btn-primary w-full !py-2">تحديث الحالة</button>
            </form>
            <a href={waCustomer} target="_blank" rel="noopener noreferrer" className="btn w-full bg-emerald !py-2 text-white"><MessageCircle className="h-4 w-4" /> مراسلة الزبون</a>
          </section>
          <section className="card p-5"><StatusTimeline order={order} /></section>
        </aside>
      </div>
    </>
  );
}
