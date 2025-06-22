/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ee4d2d',
        secondary: '#f53d2d',
        shopee: {
          orange: '#ee4d2d',
          red: '#f53d2d',
        }
      },
    },
  },
  plugins: [],
}