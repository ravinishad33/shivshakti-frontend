/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- This must look exactly like this to check views/ and layouts/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}