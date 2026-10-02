import { useState } from 'react'
import { Leaf, ShieldCheck, X } from 'lucide-react'
import PoliticaDatos from '../../pages/PoliticaDatos'

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <footer className="relative mt-auto border-t border-white/60 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl overflow-hidden">
        {/* Luz tenue de fondo en el footer para darle vida */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-green-400/10 dark:bg-green-600/5 blur-[80px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-600 dark:text-slate-400 font-medium">
            <Leaf className="text-green-600 dark:text-green-500" size={18} strokeWidth={2.5} />
            <span className="font-black text-slate-900 dark:text-white tracking-tight">Plantopolis</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700 mx-1">|</span>
            <span className="text-sm">Plantas para tu ecosistema &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-sm font-bold">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              Política de Tratamiento de Datos
            </button>
          </div>

        </div>
      </footer>

      {/* Floating Modal for Privacy Policy */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-emerald-950 dark:text-white">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <ShieldCheck className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <h2 className="text-xl font-black">Política de Tratamiento de Datos</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <PoliticaDatos />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}