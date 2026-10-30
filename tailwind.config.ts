import type { Config } from "tailwindcss";

const config: Config = {
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
      },
      fontFamily: {
        heading: ["var(--font-cairo)", "system-ui", "sans-serif"],
        body: ["var(--font-cairo)", "system-ui", "sans-serif"],
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
    },
  },
  plugins: [],
};

export default config;
