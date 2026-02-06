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
          50:  "#eaf4ff",
          100: "#d6ebff",
          200: "#add7ff",
          300: "#85c3ff",
          400: "#5caffd",
          500: "#3b9efc", // main primary
          600: "#2386e6",
          700: "#1868b8",
          800: "#104a8a",
          900: "#0a2d5c",
        },

        secondary: {
          50:  "#ecfdf7",
          100: "#d1faec",
          200: "#a7f3d9",
          300: "#6ee7bf",
          400: "#45d6a9",
          500: "#3dcc9e", // main secondary
          600: "#2fb488",
          700: "#238c6a",
          800: "#19644c",
          900: "#0f3c2f",
        },

        accent: {
          500: "#fbbf24", // optional highlight color (you can change/remove)
        },
      },
    },
  },
  plugins: [],
};
