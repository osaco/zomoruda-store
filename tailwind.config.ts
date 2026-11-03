import type { Config } from "tailwindcss";

const config: Config = {
  future: { hoverOnlyWhenSupported: true },
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#39244A",
          dark: "#24142F",
          light: "#F3EDF7",
        },
        accent: "#C9A24A",
        emerald: "#1F8A70",
        ink: "#291E31",
        muted: "#786D80",
        bg: "#FCFAFD",
        surface: "#FFFFFF",
        success: "#2E9E6A",
        warning: "#E0A100",
        danger: "#D64545",
        /** Editorial tokens — theme-aware via CSS variables (light + dark). */
        deep: "#24142F",
        plum: "#39244A",
        gold: "#C9A24A",
        gem: "#1F8A70",
        canvas: "var(--color-bg)",
        "on-deep": "#F3EDF7",
        "deep-soft": "var(--color-muted)",
        line: "var(--color-line)",
      },
      fontFamily: {
        heading: ["var(--font-cairo)", "system-ui", "sans-serif"],
        body: ["var(--font-cairo)", "system-ui", "sans-serif"],
        display: ["var(--font-reem-kufi)", "var(--font-cairo)", "system-ui", "sans-serif"],
        atelier: ["var(--font-newsreader)", "var(--font-amiri)", "serif"],
        technical: ["var(--font-courier-prime)", "var(--font-cairo)", "monospace"],
      },
      borderRadius: {
        card: "20px",
        input: "14px",
        image: "16px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(57, 36, 74, 0.12)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(110deg, #24142F 0%, #39244A 55%, #684284 100%)",
        "sparkle":
          "radial-gradient(circle at 20% 20%, rgba(201,162,74,0.14) 0, transparent 38%), radial-gradient(circle at 80% 30%, rgba(165,83,211,0.10) 0, transparent 32%), radial-gradient(circle at 50% 85%, rgba(57,36,74,0.07) 0, transparent 45%)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(.2,.7,.2,1)",
      },
      maxWidth: {
        "screen-2xl": "1536px",
      },
      keyframes: {
        "gem-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "ink-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "gem-float": "gem-float 7s ease-in-out infinite",
        "ink-in": "ink-in .7s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
