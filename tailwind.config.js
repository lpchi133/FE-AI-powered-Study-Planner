/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        custom1: "790px", // Định nghĩa breakpoint mới
      },
    },
  },
  plugins: [],
};
