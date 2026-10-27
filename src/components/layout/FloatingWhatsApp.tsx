import { MessageCircle } from "lucide-react";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(defaultWhatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-20 end-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-white shadow-soft transition duration-200 hover:brightness-110 active:scale-95 md:bottom-6 md:end-6"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
    </a>
  );
}
