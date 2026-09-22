export default function Footer() {
  return (
    <footer className="bg-green-900 dark:bg-gray-950 text-green-200 dark:text-gray-400
                       text-center py-4 text-sm mt-auto transition-colors
                       border-t border-transparent dark:border-gray-800">
      <div>🌱 Plantopolis — Plantas para tu hogar &copy; 2024</div>
      <a
        href="/politica-tratamiento-datos"
        className="inline-block mt-1 hover:underline"
      >
        Política de tratamiento de datos
      </a>
    </footer>
  )
}