import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#080b12",
        panel: "#101620",
        line: "#202b39",
        muted: "#8390a3",
        accent: "#a5f36b",
        cyan: "#66d9e8",
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"],
        mono: ["Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(165,243,107,.10)",
      },
    },
  },
  plugins: [],
};

export default config;
