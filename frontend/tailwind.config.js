/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#040508",
        surface: "#0a0d14",
        panel: "#0f1420",
        card: "#141926",
        border: "#1e2535",
        accent: "#4f8ef7",
        "accent-2": "#7c3aed",
        "accent-3": "#06d6a0",
        "accent-warm": "#f97316",
        muted: "#4a5568",
        dim: "#8892a4",
        bright: "#e2e8f0",
      },
      backgroundImage: {
        "mesh-1": "radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 60%)",
        "mesh-2": "radial-gradient(ellipse at 60% 80%, rgba(6,214,160,0.07) 0%, transparent 60%), radial-gradient(ellipse at 10% 10%, rgba(79,142,247,0.06) 0%, transparent 60%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(-20px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      boxShadow: {
        "glow-blue": "0 0 30px rgba(79,142,247,0.15), 0 0 60px rgba(79,142,247,0.05)",
        "glow-purple": "0 0 30px rgba(124,58,237,0.15)",
        "glow-green": "0 0 30px rgba(6,214,160,0.15)",
        "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};
