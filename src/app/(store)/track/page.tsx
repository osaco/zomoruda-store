import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackOrderForm } from "@/features/orders/components/TrackOrderForm";

export const metadata: Metadata = {
  title: "تتبّع الطلب",
  description: "تتبّعي حالة طلبك في متجر زمردة باستخدام رقم الطلب.",
  referrer: "no-referrer",
  alternates: { canonical: "/track" },
};

type Props = { searchParams: Promise<{ order?: string; t?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { order, t } = await searchParams;
  return (
    <>
      <PageHeader title="تتبّع الطلب" description="أدخلي رقم الطلب لمعرفة حالته" />
      <div className="container-page max-w-xl space-y-6 py-6">
        <TrackOrderForm initialOrderNumber={order} token={typeof t === "string" && t.length < 100 ? t : undefined} />
      </div>
    </>
  );
}
