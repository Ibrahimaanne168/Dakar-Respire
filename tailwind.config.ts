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
          DEFAULT: "#F6F1E7",
          surface: "#FBF8F2",
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
        level: {
          bon: "#3F7D58",
          moyen: "#C99A1E",
          mauvais: "#D2691E",
          alerte: "#A8372C",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
