import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./HomeDesign.module.css";

export function GiftBoxSpotlight({ box }: { box: { slug: string; nameAr: string } | null }) {
  return (
    <section id="gift-studio" className={`wrap ${styles.studio}`} aria-labelledby="studio-heading">
      <div className={styles.studioImage}>
        <Image src="/home/gift-studio.webp" alt="بوكس زمردي مفتوح مع كوب وورد" fill sizes="(max-width: 720px) 92vw, 45vw" />
      </div>
      <div className={styles.studioContent}>
        <p className={styles.kicker}>استوديو الهدايا</p>
        <h2 id="studio-heading">بوكس على ذوقِك.</h2>
        <p>{box ? "اختاري القطع اللي بتحبيها وأضيفي لمستك على الهدية." : "كوّني فكرة لهديّتك من الورد والعطور والقطع المخصّصة."}</p>
        <Link href={box ? `/product/${box.slug}` : "/categories"} className={styles.primary} aria-label={box ? `جهّزي ${box.nameAr}` : undefined}>
          {box ? "جهّزي بوكسك" : "تصفّحي أقسام الهدايا"} <ArrowLeft size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
