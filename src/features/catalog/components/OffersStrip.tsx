import { ArrowLeft, MessageCircle } from "lucide-react";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";

export function OffersStrip() {
  return (
    <section className="container-page py-2">
      <div className="flex flex-col items-center justify-between gap-3 rounded-card border border-primary/10 bg-primary-light px-6 py-6 text-center md:flex-row md:py-7 md:text-start">
        <div>
          <h2 className="font-heading text-xl font-bold text-primary md:text-2xl">تحتاجين مساعدة باختيار هديتك؟</h2>
          <p className="mt-1 text-sm text-muted">
            أخبرينا عن المناسبة، ونتواصل معك لتأكيد القطع المتوفرة والأسعار.
          </p>
        </div>
        <a
          href={whatsappLink(defaultWhatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          تواصلي معنا
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
