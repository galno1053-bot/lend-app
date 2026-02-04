import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui"],
        body: ["var(--font-body)", "system-ui"]
      },
      colors: {
        ink: "#0a0c10",
        mist: "#f5f7fa",
        ember: "#ff6b4a",
        jade: "#2dd4bf",
        ocean: "#0ea5e9"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1200px 600px at 15% 10%, rgba(14,165,233,0.25), transparent), radial-gradient(800px 400px at 85% 20%, rgba(45,212,191,0.2), transparent), linear-gradient(160deg, #0a0c10 0%, #101826 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
