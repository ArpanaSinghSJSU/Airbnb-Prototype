/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'airbnb': {
          'pink': '#FF385C',
          'dark': '#222222',
          'gray': '#717171',
          'light': '#F7F7F7',
        },
      },
    },
  },
  plugins: [],
}

