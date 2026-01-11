/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'gta': ['Anton', 'sans-serif'], // Fuente de títulos
        'sans': ['Inter', 'sans-serif'], // Fuente de lectura
      },
      colors: {
        'r-yellow': '#FFAB00', // Amarillo Rockstar
        'r-black': '#050505',
      },
      backgroundImage: {
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')", // Textura de grano
      }
    },
  },
  plugins: [],
}