/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070a12',
          900: '#0b1020',
          850: '#0f152b',
          800: '#141b36',
          700: '#1c2547',
          600: '#27325c',
        },
        brand: {
          50: '#eefcf5',
          100: '#d6f7e6',
          200: '#aeeccd',
          300: '#7adcb0',
          400: '#42c08c',
          500: '#1fa56f',
          600: '#128559',
          700: '#0f6a48',
          800: '#10543a',
          900: '#0e4631',
        },
        accent: {
          400: '#5eead4',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
