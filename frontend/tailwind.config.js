/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfdf8',
          100: '#d1faec',
          200: '#a8f3da',
          300: '#73e7c3',
          400: '#37d2a5',
          500: '#11b387',
          600: '#0c8f6d',
          700: '#0d7159',
          800: '#105a49',
          900: '#114b3d',
          950: '#0a2e25',
        },
        ink: '#102033',
        sand: '#f8f3e7',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 45px -20px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'grid-pattern':
          'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
