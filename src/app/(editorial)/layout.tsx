import { Suspense } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeferredCartDrawer } from "@/features/cart/components/DeferredCartDrawer";
import { SiteFooter } from "@/features/home/components/SiteFooter";
import { SiteHeader } from "@/features/home/components/SiteHeader";
import { getStoreSettings } from "@/features/settings/server/queries";

import styles from "@/features/home/components/HomeDesign.module.css";

export const dynamic = "force-dynamic";

/** Storefront chrome for the home page; cart and order controls stay shared. */
export default function EditorialHomeLayout({ children }: { children: React.ReactNode }) {


  return (
    <>
      <SiteHeader />
      <main id="main" className={`flex-1 pb-20 pt-[68px] md:pb-0 ${styles.shell}`}>
        <Suspense fallback={null}><PauseNotice /></Suspense>
        {children}
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
      <BottomNav />
      <DeferredCartDrawer />
    </>
  );
}

async function PauseNotice() {
  const settings = await getStoreSettings();
  return settings.ordersPaused && <p role="status" className="bg-warning/15 px-5 py-2 text-center">{settings.ordersPausedMessage}</p>;
}

async function Footer() {
  const settings = await getStoreSettings();
  return <SiteFooter addressAr={settings.contactAddress} whatsappNumber={settings.orderWhatsappNumber} />;
}
