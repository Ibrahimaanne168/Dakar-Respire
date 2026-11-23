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
        brand: {
          dark: "#0a192f",
          blue: "#1e3a8a",
          primary: "#2563eb",
          accent: "#38bdf8",
        },
        aqi: {
          good: "#10B981",       // Vert (0-15)
          moderate: "#FBBF24",   // Jaune (15-35)
          unhealthy: "#F97316",  // Orange (35-55)
          hazardous: "#EF4444",  // Rouge (>55)
        }
      },
    },
  },
  plugins: [],
};
export default config;
