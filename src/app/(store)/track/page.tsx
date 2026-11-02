import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackOrderForm } from "@/features/orders/components/TrackOrderForm";

export const metadata: Metadata = {
  title: "تتبّع الطلب",
  description: "تتبّعي حالة طلبك في متجر زُمُرّدة باستخدام رقم الطلب ورقم الجوال المسجل.",
  alternates: { canonical: "/track" },
};

type Props = { searchParams: Promise<{ order?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return (
    <>
      <PageHeader title="تتبّع الطلب" description="أدخلي رقم الطلب ورقم الجوال المستخدم في الطلب" />
      <div className="container-page max-w-xl space-y-6 py-6">
        <TrackOrderForm initialOrderNumber={order} />
      </div>
    </>
  );
}
