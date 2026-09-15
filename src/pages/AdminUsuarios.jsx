import { useEffect, useState } from 'react'
import {
  getUsuariosAdmin, activarUsuario, desactivarUsuario, resetearPasswordUsuario,
  crearTrabajador
} from '../api/adminApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

const ROLES = [
  { id: 1, nombre: 'ADMINISTRADOR', icono: '🛠', color: 'bg-purple-100 text-purple-800' },
  { id: 2, nombre: 'TRABAJADOR',    icono: '🌿', color: 'bg-blue-100 text-blue-800' },
  { id: 3, nombre: 'CLIENTE',       icono: '🧑', color: 'bg-green-100 text-green-800' },
]

const badgeRol = (nombreRol) => {
  const r = ROLES.find(x => x.nombre === nombreRol)
  return r ?? { icono: '❔', color: 'bg-gray-100 text-gray-600' }
}

export default function AdminUsuarios() {
  const [usuarios,    setUsuarios]    = useState([])
  const [totalPages,  setTotalPages]  = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [guardando,   setGuardando]   = useState(null)
  const [mensaje,     setMensaje]     = useState(null)
  const [passwordGenerada, setPasswordGenerada] = useState(null)
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [nuevoTrabajadorExito, setNuevoTrabajadorExito] = useState(null)

  const [filtros, setFiltros] = useState({
    nombre: '', idRol: '', activo: '', page: 0, size: 15
  })

  useEffect(() => { cargarUsuarios() }, [filtros])

  const cargarUsuarios = () => {
    setLoading(true)
    getUsuariosAdmin(filtros)
      .then(r => {
        setUsuarios(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch(() => mostrarMensaje('error', 'No se pudo cargar la lista de usuarios'))
      .finally(() => setLoading(false))
  }

  const handleFiltro = (campo, valor) =>
    setFiltros(prev => ({ ...prev, [campo]: valor, ...(campo !== 'page' && { page: 0 }) }))

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3500)
  }

  const handleToggleActivo = async (usuario) => {
    if (usuario.activo && !confirm(
      `¿Desactivar a ${usuario.nombreCompleto}? No podrá iniciar sesión hasta que lo reactives.`
    )) return

    setGuardando(usuario.idUsuario)
    try {
      if (usuario.activo) {
        await desactivarUsuario(usuario.idUsuario)
        mostrarMensaje('ok', `${usuario.nombreCompleto} fue desactivado`)
      } else {
        await activarUsuario(usuario.idUsuario)
        mostrarMensaje('ok', `${usuario.nombreCompleto} fue reactivado`)
      }
      await cargarUsuarios()
    } catch (e) {
      mostrarMensaje('error', e.response?.data?.mensaje || 'Error al cambiar el estado')
    } finally {
      setGuardando(null)
    }
  }

  const handleResetearPassword = async (usuario) => {
    if (!confirm(
      `¿Generar una contraseña temporal para ${usuario.nombreCompleto}? La contraseña actual dejará de funcionar.`
    )) return

    setGuardando(usuario.idUsuario)
    try {
      const res = await resetearPasswordUsuario(usuario.idUsuario)
      setPasswordGenerada({
        correo: usuario.correo, nombre: usuario.nombreCompleto,
        password: res.data.passwordTemporal
      })
    } catch (e) {
      mostrarMensaje('error', e.response?.data?.mensaje || 'Error al resetear la contraseña')
    } finally {
      setGuardando(null)
    }
  }

  const copiarPassword = () => {
    if (!passwordGenerada) return
    navigator.clipboard?.writeText(passwordGenerada.password)
    mostrarMensaje('ok', 'Contraseña copiada al portapapeles')
  }

  const handleCrearTrabajador = async (datos) => {
    const res = await crearTrabajador(datos)
    setNuevoTrabajadorExito({
      nombreCompleto: datos.nombreCompleto,
      correo: datos.correo,
      passwordInicial: datos.passwordInicial,
      idUsuario: res.data?.idUsuario
    })
    mostrarMensaje('ok', `Trabajador ${datos.nombreCompleto} creado exitosamente`)
    await cargarUsuarios()
  }

  const copiarCredenciales = (cred) => {
    if (!cred) return
    const texto = `Credenciales de acceso a Plantopolis:\nRol: TRABAJADOR\nUsuario: ${cred.correo}\nContraseña: ${cred.passwordInicial}\nAcceso: Panel Operativo (/trabajador)`
    navigator.clipboard?.writeText(texto)
    mostrarMensaje('ok', 'Credenciales copiadas al portapapeles')
  }

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Gestión de usuarios</h1>
          <p className="text-gray-500 text-sm">
            Clientes, trabajadores y administradores registrados en Plantopolis
          </p>
        </div>
        <Button onClick={() => setModalCrearAbierto(true)}>
          🧑‍🌾 Crear Trabajador
        </Button>
      </div>

      {nuevoTrabajadorExito && (
        <div className="mb-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-emerald-800 text-sm flex items-center gap-1.5">
                <span>✅</span> Cuenta de trabajador creada con éxito (HU11)
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                El usuario ha sido registrado con rol <strong>TRABAJADOR</strong> y estado <strong>Activo</strong>.
              </p>
              <div className="mt-2.5 text-xs text-gray-700 bg-white border border-emerald-200 rounded-lg p-3 inline-block">
                <p className="font-semibold text-gray-600 mb-1">Credenciales iniciales para el trabajador:</p>
                <p className="flex items-center gap-2 py-0.5">
                  <span className="text-gray-500">Nombre:</span>
                  <strong>{nuevoTrabajadorExito.nombreCompleto}</strong>
                </p>
                <p className="flex items-center gap-2 py-0.5">
                  <span className="text-gray-500">Usuario / Correo:</span>
                  <code className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    {nuevoTrabajadorExito.correo}
                  </code>
                </p>
                <p className="flex items-center gap-2 py-0.5">
                  <span className="text-gray-500">Contraseña inicial:</span>
                  <code className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    {nuevoTrabajadorExito.passwordInicial}
                  </code>
                </p>
              </div>
            </div>
            <button onClick={() => setNuevoTrabajadorExito(null)}
                    className="text-emerald-500 hover:text-emerald-800 text-xl leading-none">✕</button>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => copiarCredenciales(nuevoTrabajadorExito)}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-1">
              📋 Copiar credenciales
            </button>
          </div>
        </div>
      )}

      {passwordGenerada && (
        <div className="mb-5 bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                🔑 Contraseña temporal para {passwordGenerada.nombre}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {passwordGenerada.correo} — cópiala ahora, no se volverá a mostrar
              </p>
              <code className="inline-block mt-2 bg-white border border-amber-300 rounded-lg px-3 py-1.5 font-mono text-lg tracking-wider text-amber-900">
                {passwordGenerada.password}
              </code>
            </div>
            <button onClick={() => setPasswordGenerada(null)}
                    className="text-amber-400 hover:text-amber-700 text-xl leading-none">✕</button>
          </div>
          <button onClick={copiarPassword}
                  className="mt-3 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors font-medium">
            📋 Copiar contraseña
          </button>
        </div>
      )}

      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium
                         ${mensaje.tipo === 'ok'
                           ? 'bg-green-50 text-green-700 border border-green-200'
                           : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {mensaje.tipo === 'ok' ? '✅' : '⚠'} {mensaje.texto}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 flex gap-3 flex-wrap shadow-sm">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o correo..."
          value={filtros.nombre}
          onChange={e => handleFiltro('nombre', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-56"
        />
        <select
          value={filtros.idRol}
          onChange={e => handleFiltro('idRol', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-40"
        >
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.icono} {r.nombre}</option>)}
        </select>
        <select
          value={filtros.activo}
          onChange={e => handleFiltro('activo', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-36"
        >
          <option value="">Todos los estados</option>
          <option value="true">✅ Activos</option>
          <option value="false">⛔ Desactivados</option>
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-3xl mb-2">👤</p>
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Registrado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const rol = badgeRol(u.rol)
                const enAccion = guardando === u.idUsuario
                return (
                  <tr key={u.idUsuario} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{u.nombreCompleto}</p>
                      <p className="text-xs text-gray-400">{u.correo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rol.color}`}>
                        {rol.icono} {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.fechaRegistro
                        ? new Date(u.fechaRegistro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.activo ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleResetearPassword(u)} disabled={enAccion}
                                className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors font-medium disabled:opacity-50">
                          🔑 Resetear
                        </button>
                        <button onClick={() => handleToggleActivo(u)} disabled={enAccion}
                                className={`text-xs px-2 py-1 rounded transition-colors font-medium disabled:opacity-50
                                            ${u.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                          {enAccion ? '...' : u.activo ? '⊘ Desactivar' : '✓ Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => handleFiltro('page', filtros.page - 1)} disabled={filtros.page === 0}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
            ← Anterior
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Página {filtros.page + 1} de {totalPages}</span>
          <button onClick={() => handleFiltro('page', filtros.page + 1)} disabled={filtros.page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para Crear Trabajador (HU11) */}
      <ModalCrearTrabajador
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onCreado={handleCrearTrabajador}
      />
    </div>
  )
}

/**
 * Modal interactivo para que el Administrador cree cuentas con rol TRABAJADOR
 * Cumple con HU11 y RF-13 (Creación administrativa con rol fijo TRABAJADOR)
 */
function ModalCrearTrabajador({ abierto, onCerrar, onCreado }) {
  const [form, setForm] = useState({
    nombreCompleto: '',
    correo: '',
    passwordInicial: ''
  })
  const [errores, setErrores] = useState({})
  const [errorBackend, setErrorBackend] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (!abierto) return null

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errores[e.target.name]) {
      setErrores(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const validar = () => {
    const err = {}
    if (!form.nombreCompleto.trim()) {
      err.nombreCompleto = 'El nombre completo es obligatorio'
    }
    if (!form.correo.trim()) {
      err.correo = 'El correo electrónico es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      err.correo = 'Formato de correo electrónico inválido'
    }
    if (!form.passwordInicial) {
      err.passwordInicial = 'La contraseña inicial es obligatoria'
    } else if (form.passwordInicial.length < 6) {
      err.passwordInicial = 'La contraseña debe tener al menos 6 caracteres'
    }
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    setErrorBackend('')
    try {
      await onCreado({
        nombreCompleto: form.nombreCompleto.trim(),
        correo: form.correo.trim(),
        passwordInicial: form.passwordInicial
      })
      onCerrar()
    } catch (err) {
      setErrorBackend(err.response?.data?.mensaje || 'Error al crear la cuenta de trabajador')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧑‍🌾</span>
            <h2 className="text-lg font-bold text-emerald-950">Crear Cuenta de Trabajador</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 rounded-xl leading-relaxed">
            🌿 <strong>Rol Operativo:</strong> Esta cuenta se creará exclusivamente con el rol <strong>TRABAJADOR</strong>. 
            Permite al personal acceder directamente al Panel Operativo (Kanban, Lotes y Mermas) sin requerir autorregistro público.
          </div>

          <Input
            label="Nombre completo"
            name="nombreCompleto"
            required
            value={form.nombreCompleto}
            onChange={handleChange}
            placeholder="Ej: Carlos Gómez"
            error={errores.nombreCompleto}
          />

          <Input
            label="Correo electrónico"
            name="correo"
            type="email"
            required
            value={form.correo}
            onChange={handleChange}
            placeholder="trabajador@plantopolis.com"
            error={errores.correo}
          />

          <Input
            label="Contraseña inicial"
            name="passwordInicial"
            type="text"
            required
            value={form.passwordInicial}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            error={errores.passwordInicial}
          />

          {errorBackend && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{errorBackend}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Crear Trabajador
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}