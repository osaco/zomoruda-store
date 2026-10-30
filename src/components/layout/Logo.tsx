import Image from "next/image";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt=""
        width={44}
        height={44}
        priority
        className="h-10 w-10 rounded-full object-contain md:h-12 md:w-12"
      />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-xl font-extrabold text-primary md:text-2xl">
          {site.nameAr}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-muted" dir="ltr">
          {site.nameEn}
        </span>
      </span>
    </span>
  );
}
