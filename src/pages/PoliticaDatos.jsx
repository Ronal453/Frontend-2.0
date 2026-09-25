import React from 'react'

export default function PoliticaDatos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-6">
        Política de Tratamiento de Datos Personales
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Objetivo</h2>
          <p>
            Establecer las directrices y lineamientos generales para el tratamiento de los datos personales en Plantopolis, garantizando el derecho fundamental al Habeas Data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Marco normativo</h2>
          <p>
            Esta política se rige por la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas que los modifiquen o complementen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Alcance</h2>
          <p>
            Esta política aplica a los datos personales de clientes, trabajadores y administradores registrados en la plataforma Plantopolis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Datos que recolectamos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Al registrarse o iniciar sesión (Tradicional):</strong> nombre completo, correo electrónico y contraseña son obligatorios; número de contacto y dirección son opcionales. La contraseña se almacena en forma cifrada (BCrypt).</li>
            <li><strong>Al registrarse o iniciar sesión con Google:</strong> recopilamos su nombre y correo electrónico provistos por Google. Plantopolis no tiene acceso a su contraseña de Google.</li>
            <li><strong>Autenticación y Sesión:</strong> se emite un token de seguridad (JWT) válido por 24 horas. Para proteger su cuenta, el token se almacena en su navegador como una cookie <em>HttpOnly</em>, lo que evita que sea robado por scripts maliciosos. Ya no se almacena de forma expuesta en el almacenamiento local.</li>
            <li><strong>Al realizar un pedido:</strong> la dirección de envío indicada para ese pedido (puede ser distinta a la del perfil) y el método de pago seleccionado (tarjeta de crédito, tarjeta de débito, transferencia/PSE o efectivo). Plantopolis no captura ni almacena números de tarjeta ni ningún otro dato financiero sensible: únicamente registra cuál método fue elegido y el estado del pago. El sistema no está integrado con una pasarela de pagos real.</li>
            <li><strong>Historial de compras:</strong> se conserva el detalle de productos, cantidades, precios y estado de cada pedido, para dar soporte y trazabilidad al cliente.</li>
            <li><strong>Cuentas de trabajador:</strong> cuando un administrador crea una cuenta operativa, se registran nombre completo, correo y una contraseña inicial cifrada.</li>
            <li><strong>Datos operativos internos:</strong> las acciones realizadas en el panel operativo (cambios de estado de tareas, lotes de cultivo y mermas, comentarios) quedan asociadas al usuario que las ejecuta, con fines de trazabilidad y auditoría interna, no de vigilancia.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Finalidades del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Gestionar el registro, la autenticación y el perfil del usuario.</li>
            <li>Procesar, dar seguimiento y notificar el estado de los pedidos.</li>
            <li>Enviar comunicaciones transaccionales relacionadas con su pedido.</li>
            <li>Atender solicitudes, peticiones, quejas y reclamos.</li>
            <li>Cumplir obligaciones legales, contables y tributarias.</li>
            <li>Mantener trazabilidad de las operaciones internas del vivero (cultivo, tareas, mermas).</li>
          </ul>
          <p className="font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
            Plantopolis no usa los datos con fines de mercadeo o publicidad; no se envían comunicaciones comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Terceros a los que se transmiten datos</h2>
          <p>
            Plantopolis utiliza Resend como proveedor de envío de correo transaccional, cuya infraestructura se encuentra fuera de Colombia. Resend recibe el nombre y correo del cliente, el número y detalle del pedido, y la dirección de envío, únicamente para enviar la confirmación del pedido y las notificaciones de cambio de estado. No se comparten datos con terceros para fines distintos a este.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Derechos del titular</h2>
          <p>
            Usted tiene derecho a conocer, actualizar y rectificar sus datos personales; solicitar prueba de la autorización otorgada; ser informado sobre el uso dado a sus datos; presentar quejas ante la Superintendencia de Industria y Comercio (SIC); revocar la autorización y/o solicitar la supresión de sus datos, salvo que exista un deber legal o contractual que impida su eliminación inmediata; y acceder de forma gratuita a sus datos personales que hayan sido objeto de tratamiento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Canal para ejercer sus derechos</h2>
          <p>
            Puede ejercer estos derechos escribiendo a <strong>privacidad@plantopolis.com</strong>. Las consultas se resolverán en un plazo máximo de diez (10) días hábiles, y los reclamos en un plazo máximo de quince (15) días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Conservación y supresión</h2>
          <p>
            Sus datos se conservan mientras su cuenta esté activa. Ante una solicitud de supresión, sus datos de contacto se anonimizan, pero el registro histórico de sus pedidos se conserva por el tiempo exigido por la normativa contable y tributaria colombiana, sin datos que permitan identificarlo directamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Seguridad de la información</h2>
          <p>
            Plantopolis protege sus datos mediante cifrado de contraseñas, control de acceso basado en roles y autenticación por token (JWT) almacenado en cookies <em>HttpOnly</em> de alta seguridad con expiración de 24 horas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Vigencia</h2>
          <p>
            Esta política rige a partir de su publicación y permanece vigente mientras subsista la relación con el titular y/o el deber legal de conservar sus datos.
          </p>
        </section>
      </div>
    </div>
  )
}
