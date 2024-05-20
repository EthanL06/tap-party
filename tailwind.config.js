/** @type {import('tailwindcss').Config} */
import fluid, { extract, screens, fontSize } from "fluid-tailwind";
export default {
  content: {
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    extract,
  },
  theme: {
    screens,
    fontSize,
    extend: {
      fontFamily: {
        sans: ["Opificio", "sans-serif"],
      },
      colors: {
        black: "#070e14",
      },
      fontSize: {},
    },
  },
  plugins: [fluid],
};
