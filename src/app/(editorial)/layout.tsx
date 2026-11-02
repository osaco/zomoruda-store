import { BottomNav } from "@/components/layout/BottomNav";
import { DeferredCartDrawer } from "@/features/cart/components/DeferredCartDrawer";
import { SiteFooter } from "@/features/home/components/SiteFooter";
import { SiteHeader } from "@/features/home/components/SiteHeader";
import { getStoreSettings } from "@/features/settings/server/queries";
import { site } from "@/lib/site";

/**
 * Layout for the editorial home page.
 *
 * It deliberately replaces the shared store chrome: the hero needs a
 * transparent overlay header, and the footer is the cropped wordmark signature.
 * The cart drawer, bottom nav and the orders-paused notice are preserved so
 * nothing about ordering behaviour changes.
 *
 * Every other storefront route is untouched and keeps `(store)/layout.tsx`.
 */
export default async function EditorialHomeLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      {/* When ordering is paused this is the one message that must win. */}
      {settings.ordersPaused && (
        <p
          role="status"
          className="bg-warning/15 px-5 py-2 text-center text-sm text-ink"
        >
          {settings.ordersPausedMessage}
        </p>
      )}

      <SiteHeader overlay />
      {/* pb-20 clears the fixed bottom nav on mobile. */}
      <main id="main" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <SiteFooter addressAr={site.addressAr} />

      <BottomNav />
      <DeferredCartDrawer />
    </>
  );
}
