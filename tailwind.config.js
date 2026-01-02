/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,md}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/**/*.{md}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "cormorant-garamond": ["var(--font-cormorant-garamond)", "serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
