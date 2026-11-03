"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname === "/cart" || pathname === "/checkout" || pathname.startsWith("/product/")) return null;
  return (
    <a
      href={whatsappLink(defaultWhatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] end-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-white shadow-soft transition duration-200 hover:brightness-110 active:scale-95 lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] lg:end-6"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
    </a>
  );
}
