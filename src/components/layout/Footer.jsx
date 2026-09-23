import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-green-900 dark:bg-gray-950 text-green-200 dark:text-gray-400
                       text-center py-4 text-sm mt-auto transition-colors
                       border-t border-transparent dark:border-gray-800 flex flex-col items-center gap-2">
      <p>🌱 Plantopolis — Plantas para tu hogar &copy; 2024</p>
      <Link to="/politica-datos" className="hover:text-white underline">Política de Tratamiento de Datos</Link>
    </footer>
  )
}