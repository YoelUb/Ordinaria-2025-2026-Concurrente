/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rockstar-yellow': 'var(--rockstar-yellow)',
        'apple-dark': 'var(--apple-dark)',
        'apple-gray-1': 'var(--apple-gray-1)',
        'apple-gray-2': 'var(--apple-gray-2)',
        'apple-gray-3': 'var(--apple-gray-3)',
        'apple-gray-4': 'var(--apple-gray-4)',
        'apple-gray-5': 'var(--apple-gray-5)',
        'apple-white': 'var(--apple-white)',
      },
      fontFamily: {
        'gta': ['Anton', 'sans-serif'],
        'apple': ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      backdropBlur: {
        '20': '20px',
      },
      textShadow: {
        'glow': '0 0 40px rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
      fontSize: {
        '10rem': '10rem',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
      }
    },
  },
  plugins: [],
}