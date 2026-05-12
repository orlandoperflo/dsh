import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#05060a",
        obsidian: "#0a0d14",
        graphite: "#121722",
        line: "rgba(255,255,255,0.1)",
        platinum: "#f4f1e8",
        mist: "#aab2c0",
        ember: "#d8b56d",
        signal: "#8fd4ff"
      },
      boxShadow: {
        halo: "0 0 80px rgba(143, 212, 255, 0.16)",
        gold: "0 0 70px rgba(216, 181, 109, 0.15)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
