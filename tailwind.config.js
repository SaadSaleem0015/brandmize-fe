/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f3edff",
          100: "#e5dbff",
          200: "#cbb8ff",
          300: "#b094ff",
          400: "#946fff",
          500: "#7032e5", // main primary
          600: "#5e27c9",
          700: "#4a1fa3",
          800: "#36177d",
          900: "#230f57",
        },

        secondary: {
          50:  "#f3ffec",
          100: "#e4ffd2",
          200: "#c9ffa6",
          300: "#a9ff70",
          400: "#83ff4a",
          500: "#5ef839", // main secondary
          600: "#48d62a",
          700: "#37a31f",
          800: "#276f15",
          900: "#173c0c",
        },

        accent: {
          500: "#fbbf24",
        },
      },
    },
  },
  plugins: [],
};
