import React from 'react'
import { useLanguage } from '../context/LanguageContext'

/**
 * Componente que presenta la Política de Tratamiento de Datos Personales.
 * Ofrece visualización bilingüe (Español / Inglés) de acuerdo con el idioma activo
 * en la plataforma, cumpliendo la normativa de Habeas Data (Ley 1581 de 2012).
 *
 * @component
 * @returns {JSX.Element} Vista de la política de datos personales
 */
export default function PoliticaDatos() {
  const { language } = useLanguage()

  if (language === 'en') {
    return (
      <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">1. Purpose</h2>
          <p>Establish general guidelines for personal data processing at Plantopolis, guaranteeing the fundamental right to Habeas Data.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">2. Regulatory Framework</h2>
          <p>This policy is governed by Law 1581 of 2012, Decree 1377 of 2013 (compiled in Decree 1074 of 2015), and applicable regulations.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">3. Scope</h2>
          <p>This policy applies to personal data of customers, workers, and administrators registered on the Plantopolis platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">4. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Registration & Login:</strong> Full name, email, and password are required; phone number and address are optional. Passwords are encrypted with BCrypt.</li>
            <li><strong>Authentication & Session:</strong> A secure JWT token stored in HttpOnly cookies is issued.</li>
            <li><strong>Order Placement:</strong> Shipping address and payment method. Sensitive financial details (credit cards) are never stored.</li>
            <li><strong>Operational Accounts:</strong> Internal activity tracking for greenhouse workers and administrators.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">5. Purposes of Processing</h2>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Manage registration and authentication.</li>
            <li>Process orders and notify order status updates.</li>
            <li>Handle support inquiries and customer claims.</li>
            <li>Comply with legal, accounting, and tax obligations.</li>
          </ul>
          <div className="mt-4 font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            Plantopolis does not use your personal information for unsolicited commercial advertisements.
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">6. Rights of Data Subjects</h2>
          <p>You have the right to access, update, correct, and request deletion of your data by writing to <strong>privacidad@plantopolis.com</strong>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">7. Information Security</h2>
          <p>Plantopolis protects your information using password hashing, role-based access control, and stateless tokens in high-security cookies.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">1. Objetivo</h2>
        <p>Establecer las directrices y lineamientos generales para el tratamiento de los datos personales en Plantopolis, garantizando el derecho fundamental al Habeas Data.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">2. Marco normativo</h2>
        <p>Esta política se rige por la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas que los modifiquen o complementen.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">3. Alcance</h2>
        <p>Esta política aplica a los datos personales de clientes, trabajadores y administradores registrados en la plataforma Plantopolis.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">4. Datos que recolectamos</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Al registrarse o iniciar sesión (Tradicional):</strong> nombre completo, correo electrónico y contraseña son obligatorios; número de contacto y dirección son opcionales. La contraseña se almacena cifrada (BCrypt).</li>
          <li><strong>Autenticación y Sesión:</strong> se emite un token JWT almacenado de forma segura en cookies HttpOnly.</li>
          <li><strong>Al realizar un pedido:</strong> dirección de envío y método de pago. No capturamos datos financieros sensibles (tarjetas).</li>
          <li><strong>Cuentas operativas:</strong> registro interno de trabajadores para trazabilidad de acciones.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">5. Finalidades del tratamiento</h2>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Gestionar registro y autenticación.</li>
          <li>Procesar y notificar estado de pedidos.</li>
          <li>Atender quejas y reclamos.</li>
          <li>Cumplir obligaciones legales y tributarias.</li>
        </ul>
        <div className="mt-4 font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
          Plantopolis no usa los datos con fines de mercadeo o publicidad; no se envían comunicaciones comerciales.
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">6. Derechos del titular</h2>
        <p>Conocer, actualizar, rectificar y solicitar la supresión de sus datos, así como revocar la autorización enviando un correo a <strong>privacidad@plantopolis.com</strong>.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">7. Seguridad de la información</h2>
        <p>Plantopolis protege sus datos mediante cifrado de contraseñas, control de acceso basado en roles y autenticación por token (JWT) almacenado en cookies HttpOnly de alta seguridad.</p>
      </section>
    </div>
  )
}
