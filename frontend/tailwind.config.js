/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-theme": "#F6F7EC",
        "secondary-theme": "#DAD7CC",
        "terciary-theme": "#5B3C1B",
        "options" : "#F3F4F6",
      },
    },
  },
  plugins: [],
}

