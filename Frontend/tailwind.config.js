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
        navy: {
          50:  '#e8edf2',
          100: '#c5d0de',
          200: '#9eb0c7',
          300: '#7790b0',
          400: '#5a789f',
          500: '#3d618e',
          600: '#2d4d78',
          700: '#1e3860',
          800: '#102447',
          900: '#0D2137',
          950: '#081529',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#faedcc',
          200: '#f5d98a',
          300: '#f0c548',
          400: '#d4a832',
          500: '#B8943F',
          600: '#9e7a2b',
          700: '#7d5f1e',
          800: '#5c4414',
          900: '#3b2a0c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
