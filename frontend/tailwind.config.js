/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1EA",
        surface: "#FFFFFF",
        ink: "#1B2420",
        line: "#D8DED2",
        muted: "#5B6B60",
        brand: {
          50: "#E6F0EB",
          100: "#C3DACE",
          300: "#5FA085",
          500: "#1F6F52",
          600: "#185943",
          700: "#124132",
        },
        rust: {
          50: "#F5E7DF",
          300: "#CF8560",
          500: "#A6461F",
          700: "#7A3316",
        },
        amber: {
          50: "#F4EBDA",
          300: "#C99A4E",
          500: "#8A6423",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        tag: "6px",
      },
    },
  },
  plugins: [],
}
