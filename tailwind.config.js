/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        slate: {
          850: "#1e293b",
        },
      },
    },
  },
};
