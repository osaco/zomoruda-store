import { BottomNav } from "@/components/layout/BottomNav";
import { DeferredCartDrawer } from "@/features/cart/components/DeferredCartDrawer";
import { SiteFooter } from "@/features/home/components/SiteFooter";
import { SiteHeader } from "@/features/home/components/SiteHeader";
import { getStoreSettings } from "@/features/settings/server/queries";
import { site } from "@/lib/site";

import styles from "@/features/home/components/HomeDesign.module.css";

export const dynamic = "force-dynamic";

/** Storefront chrome for the home page; cart and order controls stay shared. */
export default async function EditorialHomeLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <SiteHeader />
      <main id="main" className={`flex-1 pb-20 pt-[68px] md:pb-0 ${styles.shell}`}>
        {settings.ordersPaused && (
          <p role="status" className="bg-warning/15 px-5 py-2 text-center text-sm text-ink">
            {settings.ordersPausedMessage}
          </p>
        )}
        {children}
      </main>
      <SiteFooter addressAr={site.addressAr} />
      <BottomNav />
      <DeferredCartDrawer />
    </>
  );
}
