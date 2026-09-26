/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F5F3",
        odoo: {
          dark: "#5B3A52",
          DEFAULT: "#714B67",
          light: "#875A7B",
          surface: "#FBF7F9",
        },
        safety: {
          DEFAULT: "#FF5500",
          hover: "#E04B00",
          light: "#FFF1EA",
          dark: "#CC4400",
        },
        charcoal: {
          900: "#111111",
          800: "#1E1E1E",
          700: "#2B2B2B",
          500: "#666666",
          400: "#888888",
          300: "#AAAAAA",
          200: "#CCCCCC",
          100: "#E2E2DF",
          50: "#F0F0EE",
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        display: ['"Cabinet Grotesk"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'industrial': '4px 4px 0px #111111',
        'industrial-orange': '4px 4px 0px #FF5500',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'industrial': '2px',
      }
    },
  },
  plugins: [],
}
