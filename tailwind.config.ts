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
        background: "var(--background)",
        foreground: "var(--foreground)",
        aetherius: {
          nav: '#1c1c1c',
          charcoal: '#2b2b2b',
          footer: '#181818',
          heading: '#2f2f2f',
          body: '#444444',
          muted: '#717171',
          arrow: '#cfcfcf',
          field: '#f3f3f3',
          line: '#e3e3e3',
          gold: '#ffaf19',
          'gold-2': '#ffbd07',
        },
        travel: {
          ink: '#1e1e1e',
          coal: '#151515',
          yellow: '#ffbd07',
          'yellow-dark': '#ffaf19',
          cream: '#f7f4ec',
          paper: '#ffffff',
          muted: '#717171',
          line: '#e6e1d6',
        },
        brand: {
          yellow: '#ffbd07',
          dark: '#1e1e1e',
          grey: '#f7f4ec',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      animation: {
        shimmer: "shimmer 1.5s linear infinite",
        "pulse-amber": "pulse-amber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-amber": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.4)" },
          "50%": { opacity: ".5", boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      fontFamily: {
        syne: ["var(--font-syne)"],
        sans: ["var(--font-dm-sans)"],
        jost: ["var(--font-josefin)"],
        josefin: ["var(--font-josefin)"],
      },
    },
  },
  plugins: [],
};
export default config;
