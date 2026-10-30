import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, RotateCcw } from "lucide-react";
import { getRepos } from "@/lib/data";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { verifyOrderAccessToken } from "@/lib/signing";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { StatusTimeline } from "@/features/orders/components/StatusTimeline";
import { FULFILLMENT_LABELS_AR, PAYMENT_METHOD_LABELS_AR } from "@/types/enums";

export const metadata: Metadata = { title: "تم استلام طلبك", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> };

/** Success page. Access requires the signed token issued at checkout. */
export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { t } = await searchParams;
  if (!verifyOrderAccessToken(number, t)) notFound();
  const order = await getRepos().orders.getByNumber(number);
  if (!order) notFound();

  const waUrl = whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL));

  return (
    <div className="container-page max-w-xl space-y-6 py-10">
      {/* رأس النجاح */}
      <div className="text-center space-y-3">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-bold">شكراً {order.customerName.split(" ")[0]}! 💜</h1>
        <p className="text-muted">تم حفظ طلبك بنجاح. أرسلي رسالة الواتساب أدناه لتأكيده مع المتجر.</p>
      </div>

      {/* ملخص الطلب */}
      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">رقم الطلب</p>
          <p className="font-heading text-xl font-bold text-primary" dir="ltr">{order.orderNumber}</p>
        </div>

        <dl className="space-y-1 text-sm border-t border-primary/10 pt-3">
          <div className="flex justify-between">
            <dt className="text-muted">الاستلام</dt>
            <dd className="font-bold">
              {FULFILLMENT_LABELS_AR[order.fulfillment]}
              {order.zoneNameAr ? ` – ${order.zoneNameAr}` : ""}
            </dd>
          </div>
          {order.address && (
            <div className="flex justify-between">
              <dt className="text-muted">العنوان</dt>
              <dd className="text-end max-w-[60%]">{order.address}</dd>
            </div>
          )}
          {order.deliveryDate && (
            <div className="flex justify-between">
              <dt className="text-muted">الموعد</dt>
              <dd>{order.deliveryDate}{order.timeSlot ? ` (${order.timeSlot})` : ""}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">الدفع</dt>
            <dd>{PAYMENT_METHOD_LABELS_AR[order.paymentMethod]}</dd>
          </div>
        </dl>

        {/* الحساب */}
        <dl className="space-y-1 text-sm border-t border-primary/10 pt-3">
          <div className="flex justify-between">
            <dt className="text-muted">المجموع الفرعي</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">التوصيل</dt>
              <dd>{formatPrice(order.deliveryFee)}</dd>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>الخصم{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd>-{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-primary border-t border-primary/10 pt-2">
            <dt>الإجمالي النهائي</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* زر واتساب الرئيسي */}
      <div className="space-y-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-full bg-emerald py-4 text-base text-white gap-2 justify-center"
        >
          <MessageCircle className="h-5 w-5" />
          تأكيد الطلب على واتساب
        </a>
        <p className="text-center text-xs text-muted">
          سيفتح واتساب برسالة جاهزة — اضغطي «إرسال» لإتمام التأكيد.
          {" "}
          إذا لم يفتح تلقائياً،{" "}
          <a href={waUrl} className="text-primary underline underline-offset-2">
            اضغطي هنا
          </a>
          .
        </p>
      </div>

      {/* تتبع الحالة */}
      <div className="card p-5 text-start">
        <h2 className="font-heading text-base font-bold mb-3">حالة الطلب</h2>
        <StatusTimeline order={order} />
      </div>

      {/* روابط سفلية */}
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary gap-2"
          aria-label="إعادة فتح واتساب"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة فتح واتساب
        </a>
        <Link href="/track" className="btn-secondary">تتبّع الطلب</Link>
        <Link href="/" className="btn-ghost">العودة للمتجر</Link>
      </div>
    </div>
  );
}
