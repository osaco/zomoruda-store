import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gift, MessageCircle, Sparkles } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="container-page py-5 md:py-8">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary-gradient px-6 py-10 text-white shadow-soft md:px-12 md:py-14">
        <span aria-hidden="true" className="absolute -end-20 -top-28 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <span aria-hidden="true" className="absolute -bottom-36 start-[35%] -z-10 h-80 w-80 rounded-full bg-[#B44ADE]/15 blur-3xl" />

        <div className="relative grid items-center gap-9 md:grid-cols-[1.2fr_.8fr] md:gap-6">
          <div className="text-center md:text-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white/95 backdrop-blur md:text-sm">
              <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
              متجر زُمُرّدة للهدايا · غزة - الرمال
            </span>

            <h1 className="mx-auto mt-5 max-w-2xl font-heading text-3xl font-extrabold leading-[1.45] text-white md:mx-0 md:mt-6 md:text-5xl">
              {site.tagline}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-white/80 md:mx-0 md:mt-4 md:text-base">
              بوكسات وورد وعطور وإكسسوارات وهدايا مخصّصة. تصفّحي أفكارنا واسألينا عن القطع المتوفرة.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link href="/categories" className="btn bg-white text-primary shadow-soft hover:bg-primary-light">
                تسوّقي الأقسام
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <a
                href={whatsappLink("مرحباً زُمُرّدة 👋 أرغب بالاستفسار عن الهدايا المتوفرة.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-white/35 bg-white/5 text-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                تواصلي عبر واتساب
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[280px] items-center justify-center md:max-w-[320px]">
            <span aria-hidden="true" className="absolute inset-4 rounded-full border border-white/15" />
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/5 blur-xl" />
            <div className="relative rounded-full border border-white/25 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
              <Image
                src="/logo.png"
                alt="شعار زُمُرّدة"
                width={280}
                height={280}
                priority
                className="h-48 w-48 rounded-full object-contain sm:h-52 sm:w-52 md:h-56 md:w-56"
              />
            </div>
            <span className="absolute -bottom-2 end-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-primary-dark/90 px-4 py-2 text-xs font-bold text-white shadow-soft">
              <Gift className="h-4 w-4 text-accent" aria-hidden="true" />
              لمسة تليق بمناسبتك
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
