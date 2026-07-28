/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46', // Primary theme forest green
          900: '#064E3B',
          neon: '#00F5A0', // Neon mint green highlight
        },
        accent: {
          cyan: '#00D9F5', // Cyan biometric highlight
          purple: '#A855F7',
          orange: '#F97316',
        },
        bgLight: '#F8FAFC',
        bgDark: '#080C0A', // Deep dark green-black base
        cardLight: '#FFFFFF',
        cardDark: '#111815', // High-contrast forest card base
        borderLight: '#E2E8F0',
        borderDark: '#1C2621', // Dark border matching the forest tone
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem', // 24px corners
        '2xl': '1rem',   // 16px corners
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
        'neon': '0 0 15px rgba(0, 245, 160, 0.15)',
        'neon-cyan': '0 0 15px rgba(0, 217, 245, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
