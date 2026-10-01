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
        brand: {
          dark: '#0b0f19',
          surface: '#151c2c',
          card: '#1e293b',
          border: '#334155',
          alert: '#dc2626',
          alertBright: '#ef4444',
          alertGlow: 'rgba(220, 38, 38, 0.4)',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4',
          blue: '#2563eb'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sos-ring': 'sosRing 2s infinite',
        'sos-ring-delayed': 'sosRing 2s infinite 0.6s',
        'beacon-spin': 'spin 8s linear infinite',
      },
      keyframes: {
        sosRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.45)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
