/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",      // voor alles in src/
    "./pages/**/*.{js,ts,jsx,tsx}",    // als pages direct onder project staan
    "./components/**/*.{js,ts,jsx,tsx}", // als je Bolt/Stackblitz gebruikt
    "./app/**/*.{js,ts,jsx,tsx}"       // als je de App Router gebruikt (optioneel)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
