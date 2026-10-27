---
name: arabic-rtl-design
description: Arabic RTL, mobile-first design system for the Zomoruda gift store (colors, fonts, components). Use for any UI work.
---
# Arabic RTL design
- <html lang="ar" dir="rtl">; use Tailwind logical utilities (ms-, me-, ps-, pe-, start-, end-), never left/right.
- Fonts (next/font/google): headings "Reem Kufi", body "Tajawal" 400/500/700. Prices bold, "₪" after the number.
- Tokens (tailwind theme + CSS vars): primary #6B2FA0, primary-dark #4A1D73, primary-light #F4EDFA, accent gold #C9A24A, emerald #1F8A70 (small touches), ink #2A1640, muted #7A6A8A, bg #FCFAFE, surface #FFFFFF, success #2E9E6A, warning #E0A100, danger #D64545.
- Radius: cards 20px, inputs 14px, images 16px, buttons pill. Shadow: 0 8px 24px rgba(107,47,160,0.10).
- Primary button: gradient #6B2FA0 -> #8E4FC7, white text. Secondary: lavender bg, purple text.
- Mood: soft premium gift boutique, lots of white space, photos are the hero. Gold ribbon dividers, faint sparkle pattern on hero, emerald gem icon in loaders/empty states.
- Mobile-first (test 360px). Sticky bottom nav on mobile: الرئيسية، الأقسام، بحث، السلة (badge)، واتساب. Floating WhatsApp button.
- Icons lucide-react stroke 1.75. Transitions 150-250ms. AA contrast, visible focus rings, labels on inputs.
- Logo: /public/logo.png (header 40px mobile / 52px desktop). Fallback text logo "زُمُرّدة" in Reem Kufi purple + small gold gift icon.
