/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cormorant-garamond': ['var(--font-cormorant-garamond)', 'serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif']
      },
    },
  },
  plugins: [],
}
