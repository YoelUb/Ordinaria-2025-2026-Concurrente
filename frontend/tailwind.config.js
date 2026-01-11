/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Usamos 'luxury' para Playfair
        'luxury': ['"Playfair Display"', 'serif'],

        'sans-clean': ['"Inter"', 'sans-serif'],
      },
      colors: {
        'luxury-gold': '#D4AF37',
        'luxury-black': '#0a0a0a',
        'luxury-gray': '#F5F5F7',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}