import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getRepos } from "@/lib/data";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { verify } from "@/lib/signing";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { StatusTimeline } from "@/features/orders/components/StatusTimeline";

export const metadata: Metadata = { title: "تم استلام طلبك", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> };

/** Success page. Access requires the signed token issued at checkout. */
export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { t } = await searchParams;
  if (!verify(number, t)) notFound();
  const order = await getRepos().orders.getByNumber(number);
  if (!order) notFound();

  return (
    <div className="container-page max-w-xl space-y-6 py-10 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden="true" />
      <div>
        <h1 className="font-heading text-3xl font-bold">شكراً {order.customerName.split(" ")[0]}! 💜</h1>
        <p className="mt-2 text-muted">تم حفظ طلبك. أرسلي رسالة الواتساب لتأكيده.</p>
      </div>
      <div className="card space-y-1 p-5">
        <p className="text-sm text-muted">رقم الطلب</p>
        <p className="font-heading text-2xl font-bold text-primary" dir="ltr">{order.orderNumber}</p>
        <p className="text-sm">الإجمالي: <strong>{formatPrice(order.total)}</strong></p>
      </div>
      <a href={whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL))} target="_blank" rel="noopener noreferrer" className="btn w-full bg-emerald py-4 text-base text-white">
        <MessageCircle className="h-5 w-5" /> تأكيد الطلب على واتساب
      </a>
      <div className="card p-5 text-start">
        <StatusTimeline order={order} />
      </div>
      <div className="flex justify-center gap-3">
        <Link href={`/track?order=${order.orderNumber}`} className="btn-secondary">تتبّع الطلب</Link>
        <Link href="/" className="btn-ghost">العودة للمتجر</Link>
      </div>
    </div>
  );
}
