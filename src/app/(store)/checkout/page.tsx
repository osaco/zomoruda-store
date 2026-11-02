import type { Metadata } from "next";
import { getRepos } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { getStoreSettings } from "@/features/settings/server/queries";

export const metadata: Metadata = { title: "إتمام الطلب", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [zones, settings] = await Promise.all([getRepos().zones.list(), getStoreSettings()]);
  return (
    <>
      <PageHeader title="إتمام الطلب" crumbs={[{ href: "/cart", label: "السلة" }]} />
      <div className="container-page py-6">
        {settings.ordersPaused ? (
          <p className="card p-6 text-center text-warning">{settings.ordersPausedMessage}</p>
        ) : (
          <CheckoutForm zones={zones} bankDetails={settings.bankDetails} />
        )}
      </div>
    </>
  );
}
