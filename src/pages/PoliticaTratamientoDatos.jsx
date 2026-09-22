import { Link } from 'react-router-dom'

export default function PoliticaTratamientoDatos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          to="/catalogo"
          className="text-sm text-green-700 dark:text-green-400 hover:underline"
        >
          ← Volver al catálogo
        </Link>
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mt-4">
          Política de Tratamiento de Datos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Versión 1.0 · Documento informativo
        </p>
      </div>

      <article className="prose dark:prose-invert max-w-none">
        <p>
          Esta política describe el tratamiento de datos personales asociado a
          las funcionalidades actualmente implementadas en Plantopolis.
        </p>

        <h2>Datos tratados</h2>
        <p>
          Plantopolis puede tratar nombre completo, correo electrónico,
          teléfono, dirección, datos de cuenta y credenciales almacenadas
          mediante hash. También trata información de pedidos, envíos y
          pagos necesaria para operar la plataforma.
        </p>

        <h2>Finalidades</h2>
        <ul>
          <li>Crear y administrar cuentas.</li>
          <li>Autenticar usuarios y aplicar permisos por rol.</li>
          <li>Gestionar carrito, pedidos, envíos y pagos.</li>
          <li>Enviar comunicaciones operativas relacionadas con el servicio.</li>
          <li>Gestionar tareas, lotes, mermas y trazabilidad interna.</li>
          <li>Mantener la seguridad y funcionamiento de la plataforma.</li>
        </ul>

        <h2>Roles y acceso</h2>
        <p>
          El sistema contempla los roles CLIENTE, TRABAJADOR y ADMINISTRADOR,
          con funcionalidades diferenciadas según cada rol.
        </p>

        <h2>Pagos</h2>
        <p>
          Plantopolis registra el método, estado, monto y, cuando corresponde,
          el identificador de transacción asociado al pago. No se declara el
          almacenamiento de números completos de tarjeta o códigos de
          seguridad porque esos datos no forman parte del esquema revisado.
        </p>

        <h2>Derechos</h2>
        <p>
          Las consultas y solicitudes relacionadas con datos personales deben
          dirigirse al canal de atención definido por el responsable del
          tratamiento.
        </p>

        <h2>Responsable y contacto</h2>
        <p>
          Estos datos deben completarse antes de la publicación definitiva de
          la política: responsable, identificación, dirección, correo de
          atención y fecha de entrada en vigencia.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          La versión completa de la política se encuentra en
          <code>docs/politica-tratamiento-datos.md</code>.
        </p>
      </article>
    </div>
  )
}
