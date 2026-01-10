/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        gta: ['Anton', 'sans-serif'],
      },
      colors: {
        rockstar: {
          yellow: '#FFAB00',
          black: '#0a0a0a',
          gray: '#1c1c1c'
        }
      }
    },
  },
  plugins: [],
}