export default {
  darkMode: 'class', // ← activa el modo oscuro basado en la clase .dark
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      keyframes: {
        shine: {
          '100%': { transform: 'translateX(400%)' },
        }
      },
      animation: {
        shine: 'shine 1s ease-in-out',
      }
    } 
  },
  plugins: [],
}