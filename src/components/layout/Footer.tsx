import Link from "next/link";
import { Clock, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, defaultWhatsappMessage, whatsappLink } from "@/lib/site";
import { navLinks } from "@/lib/nav";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 hidden border-t border-primary/5 bg-surface md:block">
      <div className="container-page grid grid-cols-3 gap-8 py-12">
        <div>
          <Logo />
          <p className="mt-3 text-sm leading-7 text-muted">{site.descriptionAr}</p>
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold text-ink">روابط سريعة</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {[...navLinks, { href: "/track", label: "تتبّع طلبك" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold text-ink">تواصل معنا</h3>
          <ul className="mt-3 flex flex-col gap-3 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <a
                href={whatsappLink(defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
                dir="ltr"
              >
                +{site.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald" strokeWidth={1.75} />
              <a
                href={whatsappLink(defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
              >
                الطلب عبر واتساب
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <a
                href={`https://instagram.com/${site.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
                dir="ltr"
              >
                @{site.instagram}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
              >
                {site.addressAr}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>{site.hoursAr}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary/5 py-5">
        <p className="container-page text-center text-xs text-muted">
          © {new Date().getFullYear()} {site.nameAr} — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
