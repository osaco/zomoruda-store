"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function AppIntro() {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!matchMedia("(display-mode: standalone) and (prefers-reduced-motion: no-preference)").matches) return;
    try {
      if (sessionStorage.getItem("zomoruda-intro")) return;
    } catch { /* Storage is optional. */ }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!visible || !loaded) return;
    // The animation lasts 2460 ms. Hold the final logo before revealing the store.
    const timer = window.setTimeout(finish, 3400);
    return () => window.clearTimeout(timer);
  }, [visible, loaded]);

  function finish() {
    try { sessionStorage.setItem("zomoruda-intro", "1"); } catch { /* Storage is optional. */ }
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <button type="button" aria-label="تخطي افتتاحية زمردة" onClick={finish}
      className="fixed inset-0 z-[100] grid h-dvh w-full place-items-center bg-[#1e1229] motion-reduce:hidden">
      <Image src="/home/butterfly-intro.webp" alt="" width={320} height={512} unoptimized loading="eager"
        onLoad={() => setLoaded(true)} onError={finish} className="h-full w-full object-contain" />
    </button>
  );
}
