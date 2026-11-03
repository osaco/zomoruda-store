import { BottomNav } from "@/components/layout/BottomNav";
import { DeferredCartDrawer } from "@/features/cart/components/DeferredCartDrawer";
import { AtelierButterfly } from "@/features/home/components/AtelierButterfly";
import { AtelierFooter } from "@/features/home/components/AtelierSections";
import { AtelierHeader } from "@/features/home/components/AtelierHeader";
import { getStoreSettings } from "@/features/settings/server/queries";
import "@/features/home/atelier.css";

/**
 * Layout for the atelier home page.
 *
 * The atelier home page has its own stationery-inspired chrome. The cart
 * drawer, bottom navigation and orders-paused notice remain wired to the store.
 *
 * Every other storefront route is untouched and keeps `(store)/layout.tsx`.
 */
export default async function EditorialHomeLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <div className="atelier-shell">
      <AtelierHeader />
      {/* When ordering is paused this is the one message that must win. */}
      {settings.ordersPaused && (
        <p
          role="status"
          className="atelier-paused"
        >
          {settings.ordersPausedMessage}
        </p>
      )}

      <main id="main" className={`atelier-main${settings.ordersPaused ? " atelier-main-paused" : ""}`}>
        {children}
      </main>
      <AtelierFooter />

      <div className="atelier-bottom"><BottomNav /></div>
      <DeferredCartDrawer />
      <AtelierButterfly />
    </div>
  );
}
