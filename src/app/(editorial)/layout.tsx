import { BottomNav } from "@/components/layout/BottomNav";
import { DeferredCartDrawer } from "@/features/cart/components/DeferredCartDrawer";
import { SiteFooter } from "@/features/home/components/SiteFooter";
import { SiteHeader } from "@/features/home/components/SiteHeader";
import { getStoreSettings } from "@/features/settings/server/queries";
import { site } from "@/lib/site";

/** Storefront chrome for the home page; cart and order controls stay shared. */
export default async function EditorialHomeLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      {settings.ordersPaused && (
        <p role="status" className="bg-warning/15 px-5 py-2 text-center text-sm text-ink">
          {settings.ordersPausedMessage}
        </p>
      )}
      <SiteHeader overlay />
      <main id="main" className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter addressAr={site.addressAr} />
      <BottomNav />
      <DeferredCartDrawer />
    </>
  );
}
