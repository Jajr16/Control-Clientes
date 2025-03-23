/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "secondary-theme": "#DAD7CC",
        "terciary-theme": "#5B3C1B",
      },
    },
  },
  plugins: [],
}

