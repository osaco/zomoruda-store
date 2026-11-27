"use client";

import { useEffect, useState } from "react";

export function AppIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!matchMedia("(display-mode: standalone) and (prefers-reduced-motion: no-preference)").matches) return;
    try {
      if (sessionStorage.getItem("zomoruda-intro")) return;
      sessionStorage.setItem("zomoruda-intro", "1");
    } catch { /* The intro also works when session storage is unavailable. */ }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <button type="button" aria-label="تخطي افتتاحية زمردة" onClick={() => setVisible(false)}
      className="fixed inset-0 z-[100] h-dvh w-full bg-[#1e1229] bg-contain bg-center bg-no-repeat motion-reduce:hidden"
      style={{ backgroundImage: "url(/home/butterfly.webp)" }} />
  );
}
