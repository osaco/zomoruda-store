"use client";

import { useState } from "react";
import Image from "next/image";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {!failed ? (
        <Image
          src="/logo.png"
          alt={site.nameAr}
          width={120}
          height={52}
          priority
          onError={() => setFailed(true)}
          className="h-10 w-auto md:h-[52px]"
        />
      ) : (
        <span className="flex items-center gap-2">
          <Gift className="h-7 w-7 text-accent md:h-8 md:w-8" strokeWidth={1.75} />
          <span className="font-heading text-2xl font-bold text-primary md:text-3xl">
            {site.nameAr}
          </span>
        </span>
      )}
    </span>
  );
}
