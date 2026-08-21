/** Dark console palette: deep slate surfaces, emerald primary, mint accents. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#0B1220",        // app background
        surface: "#111A2B",       // sidebar / header
        panel: "#141F33",         // cards
        "panel-2": "#1A2740",     // raised rows, inputs
        ink: "#E8EEF7",           // primary text
        muted: "#8A9BB4",         // secondary text
        line: "#22304A",          // borders
        brand: "#10B981",
        "brand-dark": "#059669",
        "brand-soft": "#0E2A22",
        mint: "#5EEAD4",
        warn: "#F59E0B",
        danger: "#F05252",
        info: "#60A5FA",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { card: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.30)",
        lift: "0 10px 30px rgba(0,0,0,0.40)",
        glow: "0 0 0 1px rgba(16,185,129,0.30), 0 8px 24px rgba(16,185,129,0.12)",
      },
    },
  },
  plugins: [],
};
