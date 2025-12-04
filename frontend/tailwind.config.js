// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FB7411',
          blue: '#1E3A8A',
          light: '#F3F4F6',
        }
      },
    },
  },
  plugins: [],
}