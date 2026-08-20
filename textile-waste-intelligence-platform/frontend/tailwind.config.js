/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep forest green — primary brand color, not a neon "eco" green
        forest: {
          50: '#EBF5EF',
          100: '#D2E8DC',
          200: '#A5D1B8',
          300: '#71B491',
          400: '#3F9670',
          500: '#1F7A54',
          600: '#186344',
          700: '#134E37',
          800: '#0F3D2B',
          900: '#0B2D20',
        },
        // Cool structural blue — secondary accent for links, data, status
        ledger: {
          50: '#EEF3FC',
          100: '#D6E2F7',
          200: '#AEC5EF',
          300: '#7FA3E4',
          400: '#4E7FD6',
          500: '#2563EB',
          600: '#1E4FBE',
          700: '#183E96',
          800: '#132F72',
          900: '#0E2255',
        },
        canvas: '#FAFBF9',
        ink: '#12211B',
      },
      fontFamily: {
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15, 61, 43, 0.08), 0 8px 24px -8px rgba(15, 61, 43, 0.10)',
        card: '0 1px 2px rgba(15, 61, 43, 0.06), 0 6px 20px -6px rgba(15, 61, 43, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
