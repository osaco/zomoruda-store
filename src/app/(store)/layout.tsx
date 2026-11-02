import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { getStoreSettings } from "@/features/settings/server/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <>
      <AnnouncementBar
        text={settings.ordersPaused ? settings.ordersPausedMessage : settings.announcement}
        tone={settings.ordersPaused ? "warning" : "default"}
      />
      <Header />
      <main id="main" className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
      <CartDrawer />
    </>
  );
}
