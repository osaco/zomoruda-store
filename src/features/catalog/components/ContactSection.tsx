import {
  Clock,
  Gift,
  Instagram,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

export function ContactSection() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container-page grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
            نحن قريبون منك دائماً
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            اطلبي هديتك وسنجهّزها بعناية، ويمكنك التواصل معنا مباشرةً على واتساب لتأكيد الطلب أو الاستفسار.
          </p>

          <ul className="mt-6 flex flex-col gap-4 text-sm">
            <li className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-emerald" strokeWidth={1.75} aria-hidden="true" />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink transition hover:text-primary"
                dir="ltr"
              >
                +{site.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Instagram className="h-5 w-5 text-accent" strokeWidth={1.75} aria-hidden="true" />
              <a
                href={`https://instagram.com/${site.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink transition hover:text-primary"
                dir="ltr"
              >
                @{site.instagram}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink transition hover:text-primary"
              >
                {site.addressAr}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-medium text-ink">{site.hoursAr}</span>
            </li>
          </ul>
        </div>

        <div className="card flex flex-col items-center gap-4 bg-bg p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <Gift className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="font-heading text-xl font-bold text-ink">جاهزون لطلبك</h3>
          <p className="text-sm leading-7 text-muted">
            الدفع عند الاستلام أو تحويل بنكي/محفظة مع صورة الإشعار — والتأكيد عبر واتساب.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            تواصلي معنا الآن
          </a>
        </div>
      </div>
    </section>
  );
}
