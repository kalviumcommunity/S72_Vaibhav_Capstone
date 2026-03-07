/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff4a17',
        'primary-dark': '#e0400f',
        heading: '#273d4e',
        dark: '#000910',
        'light-bg': '#f1f4fa',
        'text-default': '#444444',
        'surface': '#ffffff',
      },
      fontFamily: {
        heading: ['Raleway', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
        nav: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dewi': '0px 0 30px rgba(0, 0, 0, 0.1)',
        'dewi-lg': '0px 0 50px rgba(0, 0, 0, 0.12)',
        'dewi-hover': '0px 0 35px rgba(0, 0, 0, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}