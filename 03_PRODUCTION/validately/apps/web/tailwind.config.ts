import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0a0f",
          1: "#12121a",
          2: "#1a1a25",
          3: "#222230",
        },
        content: {
          DEFAULT: "#e4e4ed",
          subtle: "#8888a0",
        },
        border: "#2a2a3a",
        brand: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
