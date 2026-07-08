/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        forum: ["Forum", "cursive", "serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      colors: {
        gold: "hsl(38, 61%, 73%)",
        background: {
          primary: "#0E0D0C",
          secondary: "#161412",
          tertiary: "#1E1C1A",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
