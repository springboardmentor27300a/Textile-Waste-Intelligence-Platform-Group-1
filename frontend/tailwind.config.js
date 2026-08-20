/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {

      colors: {

        /* Brand */

        primary: "#2563EB",
        secondary: "#10B981",
        accent: "#3B82F6",

        /* Layout */

        sidebar: "#0F172A",
        background: "#F8FAFC",
        surface: "#FFFFFF",

        /* Text */

        heading: "#0F172A",
        body: "#334155",
        muted: "#64748B",

        /* Status */

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#0EA5E9",

        /* Borders */

        border: "#E2E8F0",

        /* Extra */

        card: "#FFFFFF",

      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      borderRadius: {
        sm: "10px",
        DEFAULT: "14px",
        lg: "18px",
        xl: "22px",
        "2xl": "28px",
      },

      boxShadow: {

        card:
          "0 4px 16px rgba(15,23,42,0.06)",

        hover:
          "0 10px 30px rgba(15,23,42,0.10)",

        floating:
          "0 20px 45px rgba(15,23,42,0.12)",

      },

      transitionDuration: {
        DEFAULT: "250ms",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },

    },
  },

  plugins: [],
};