/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ee352b', // Rocket Red
        'primary-dark': '#c41c36',
        'primary-light': '#f74428',
        dark: '#0f172a', // Slate 900
        light: '#f8fafc', // Slate 50
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'rocket-gradient': 'linear-gradient(135deg, #c41c36 0%, #f74428 50%, #ee352b 100%)',
      },
    },
  },
  plugins: [],
}