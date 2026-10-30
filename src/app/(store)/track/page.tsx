import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackOrderForm } from "@/features/orders/components/TrackOrderForm";

export const metadata: Metadata = { title: "تتبّع الطلب" };

export default function TrackPage() {
  return (
    <>
      <PageHeader title="تتبّع الطلب" description="أدخلي رقم الطلب ورقم الجوال المستخدم في الطلب" />
      <div className="container-page max-w-xl space-y-6 py-6">
        <TrackOrderForm />
      </div>
    </>
  );
}
