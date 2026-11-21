import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";
import styles from "./HomeDesign.module.css";

export function Hero({ addressAr }: { addressAr: string }) {
  return (
    <section data-testid="hero" className={styles.hero}>
      <div className={`wrap ${styles.heroGrid}`}>
        <div>
          <p className={styles.kicker}>{addressAr}</p>
          <h1 className={styles.headline}>هدايا تُشبه<br /><span>مَن تُهديها.</span></h1>
          <p className={styles.intro}>
            من لون التغليف لآخر كلمة على الكرت، اختاري التفاصيل اللي بتحكي عن الشخص اللي ببالك.
          </p>
          <div className={styles.actions}>
            <Link href="/search" className={styles.primary}>
              تصفّحي المنتجات <ArrowLeft size={18} aria-hidden />
            </Link>
            <a href={whatsappLink(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
              اسألي عبر واتساب
            </a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image src="/home/roses.webp" alt="باقة ورد جوري بتغليف عاجي" fill preload sizes="(max-width: 720px) 92vw, 49vw" />
        </div>
      </div>
    </section>
  );
}
