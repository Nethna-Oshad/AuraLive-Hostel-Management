/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo
        secondary: '#10B981', // Emerald
        darkBg: '#111827', // Dark Gray
        lightBg: '#F3F4F6', // Light Gray
        brandBlue: '#2872A1', // Your custom blue
        brandLight: '#CBDDE9', // Your custom light blue
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // <-- Forces the entire app to use the clean Inter font
      },
    },
  },
  plugins: [],
}