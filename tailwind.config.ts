import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          DEFAULT: "#F4EFE6",
          surface: "#FBF8F2",
          card: "#FFFFFF",
          line: "#E4DCCB",
          dark: "#E8DEC8",
        },
        ink: {
          DEFAULT: "#1B1F23",
          muted: "#66645E",
          subtle: "#8E8B82",
        },
        terracotta: {
          DEFAULT: "#B5532A",
          hover: "#9C431F",
          light: "#F7ECE6",
        },
        teal: {
          DEFAULT: "#1F5C5E",
          deep: "#173F42",
          light: "#EAF2F2",
        },
        ochre: {
          DEFAULT: "#E9A15B",
          light: "#FDF4EB",
        },
        level: {
          bon: "#3F7D58",
          moyen: "#C99A1E",
          mauvais: "#D2691E",
          alerte: "#A8372C",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,10,0.04), 0 8px 24px rgba(20,20,10,0.06)",
        "card-hover": "0 2px 4px rgba(20,20,10,0.06), 0 12px 32px rgba(20,20,10,0.09)",
        pill: "0 2px 8px rgba(20,20,10,0.08)",
      },
      borderRadius: {
        card: "18px",
        pill: "9999px",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Instrument Sans", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
