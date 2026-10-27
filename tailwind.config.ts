import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6B2FA0",
          dark: "#4A1D73",
          light: "#F4EDFA",
        },
        accent: "#C9A24A",
        emerald: "#1F8A70",
        ink: "#2A1640",
        muted: "#7A6A8A",
        bg: "#FCFAFE",
        surface: "#FFFFFF",
        success: "#2E9E6A",
        warning: "#E0A100",
        danger: "#D64545",
      },
      fontFamily: {
        heading: ["var(--font-reem-kufi)", "system-ui", "sans-serif"],
        body: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        input: "14px",
        image: "16px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(107, 47, 160, 0.10)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #6B2FA0 0%, #8E4FC7 100%)",
        "sparkle":
          "radial-gradient(circle at 20% 20%, rgba(201,162,74,0.14) 0, transparent 38%), radial-gradient(circle at 80% 30%, rgba(201,162,74,0.10) 0, transparent 32%), radial-gradient(circle at 50% 85%, rgba(107,47,160,0.08) 0, transparent 45%)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
