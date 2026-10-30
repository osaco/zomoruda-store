import Image from "next/image";
import { ArrowLeft, Instagram } from "lucide-react";
import { site } from "@/lib/site";

const examples = [
  {
    name: "بوكسات الهدايا",
    description: "أفكار تغليف وترتيب للمناسبات",
    image: "/showcase/gift-box.svg",
  },
  {
    name: "الورد والتنسيقات",
    description: "لمسة زهور للمناسبات الجميلة",
    image: "/showcase/flowers.svg",
  },
  {
    name: "العطور",
    description: "اختيارات أنيقة للهدايا",
    image: "/showcase/perfume.svg",
  },
  {
    name: "مستحضرات التجميل",
    description: "تفاصيل العناية والجمال",
    image: "/showcase/cosmetics.svg",
  },
  {
    name: "أكواب وهدايا مخصصة",
    description: "لمسة شخصية تحمل اسماً أو ذكرى",
    image: "/showcase/mug.svg",
  },
  {
    name: "إكسسوارات وساعات",
    description: "قطع أنيقة لتكتمل الهدية",
    image: "/showcase/watch.svg",
  },
] as const;

export function DisplayOnlyShowcase() {
  return (
    <section id="display-showcase" className="container-page py-10 md:py-14" aria-labelledby="display-showcase-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-primary">أفكار من زُمُرّدة</p>
          <h2 id="display-showcase-title" className="font-heading text-2xl font-extrabold text-ink md:text-3xl">
            هدية لكل حكاية
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
            رسومات مستوحاة من أقسام المتجر للعرض فقط؛ لا تمثل المخزون الحالي ولا يمكن إضافتها للسلة. شاهدي صور القطع الفعلية على إنستغرام.
          </p>
        </div>
        <a
          href={`https://instagram.com/${site.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary shrink-0 self-start sm:self-auto"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          صور المتجر
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {examples.map((example) => (
          <li key={example.name} className="card group overflow-hidden">
            <div className="relative aspect-[4/4.5] overflow-hidden bg-primary-light">
              <Image
                src={example.image}
                alt={`رسم توضيحي: ${example.name}`}
                fill
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 23vw, 260px"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute start-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur">
                للعرض فقط
              </span>
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-heading text-sm font-bold text-ink md:text-base">{example.name}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{example.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
