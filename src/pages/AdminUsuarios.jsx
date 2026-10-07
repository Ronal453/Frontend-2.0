import { useEffect, useState } from 'react'
import {
  getUsuariosAdmin, activarUsuario, desactivarUsuario, resetearPasswordUsuario,
  crearTrabajador
} from '../api/adminApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'
import FlashMessage from '../components/ui/FlashMessage'
import { 
  Users, UserCheck, UserX, UserPlus, Shield, HardHat, User, 
  Key, Copy, Search, CheckCircle, XCircle, Loader2, X 
} from 'lucide-react'

const ROLES = [
  { id: 1, nombre: 'ADMINISTRADOR', icono: <Shield size={14} />, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' },
  { id: 2, nombre: 'TRABAJADOR',    icono: <HardHat size={14} />, color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50' },
  { id: 3, nombre: 'CLIENTE',       icono: <User size={14} />, color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' },
]

const badgeRol = (nombreRol) => {
  const r = ROLES.find(x => x.nombre === nombreRol)
  return r ?? { icono: <User size={14} />, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }
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
    if (usuario.activo && !window.confirm(
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
    if (!window.confirm(
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
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-auto custom-scrollbar">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
              <Users size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Administra clientes, trabajadores y administradores
              </p>
            </div>
          </div>
          <button 
            onClick={() => setModalCrearAbierto(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-teal-500/20 transition-all duration-200"
          >
            <UserPlus size={18} />
            <span>Crear Trabajador</span>
          </button>
        </div>

        <FlashMessage mensaje={mensaje} />

        {/* CREADO CON ÉXITO - TARJETA DE CREDENCIALES */}
        {nuevoTrabajadorExito && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Cuenta de trabajador creada con éxito
                </p>
                <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                  El usuario ha sido registrado con rol <strong className="text-emerald-800 dark:text-emerald-300">TRABAJADOR</strong> y estado Activo.
                </p>
                <div className="mt-4 bg-white/60 dark:bg-slate-900/50 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 inline-block shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                    Credenciales Iniciales
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 w-24">Nombre:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{nuevoTrabajadorExito.nombreCompleto}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 w-24">Usuario:</span>
                      <code className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded">
                        {nuevoTrabajadorExito.correo}
                      </code>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 w-24">Contraseña:</span>
                      <code className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded">
                        {nuevoTrabajadorExito.passwordInicial}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setNuevoTrabajadorExito(null)}
                      className="text-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <button onClick={() => copiarCredenciales(nuevoTrabajadorExito)}
                      className="flex items-center gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20">
                <Copy size={16} /> Copiar credenciales
              </button>
            </div>
          </div>
        )}

        {/* CONTRASEÑA TEMPORAL */}
        {passwordGenerada && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <Key size={20} />
                  Contraseña temporal para {passwordGenerada.nombre}
                </p>
                <p className="text-sm font-medium text-amber-700/80 dark:text-amber-400/80 mt-1">
                  {passwordGenerada.correo} — Cópiala ahora, no se volverá a mostrar
                </p>
                <div className="mt-4 inline-block">
                  <code className="bg-white/80 dark:bg-slate-900/50 border border-amber-200 dark:border-amber-700/50 rounded-xl px-5 py-2.5 font-mono text-xl font-bold tracking-widest text-amber-700 dark:text-amber-400 shadow-sm">
                    {passwordGenerada.password}
                  </code>
                </div>
              </div>
              <button onClick={() => setPasswordGenerada(null)}
                      className="text-amber-500/50 hover:text-amber-700 dark:hover:text-amber-300 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <button onClick={copiarPassword}
                      className="flex items-center gap-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20">
                <Copy size={16} /> Copiar contraseña
              </button>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row gap-4 shadow-sm items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filtros.nombre}
              onChange={e => handleFiltro('nombre', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
            />
          </div>
          <select
            value={filtros.idRol}
            onChange={e => handleFiltro('idRol', e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
          >
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select
            value={filtros.activo}
            onChange={e => handleFiltro('activo', e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Desactivados</option>
          </select>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
              <Users size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
              <p className="font-medium">No se encontraron usuarios con esos filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Usuario</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Rol</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Registrado</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {usuarios.map(u => {
                    const rol = badgeRol(u.rol)
                    const enAccion = guardando === u.idUsuario
                    return (
                      <tr key={u.idUsuario} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors duration-200">
                        {/* USUARIO */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{u.nombreCompleto}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{u.correo}</p>
                        </td>
                        {/* ROL */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-xl ${rol.color}`}>
                            {rol.icono} {u.rol}
                          </span>
                        </td>
                        {/* FECHA REGISTRO */}
                        <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                          {u.fechaRegistro
                            ? new Date(u.fechaRegistro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' })
                            : '—'}
                        </td>
                        {/* ESTADO */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-xl border
                            ${u.activo 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                          >
                            {u.activo ? <UserCheck size={14} /> : <UserX size={14} />}
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {/* ACCIONES */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleResetearPassword(u)} disabled={enAccion} title="Resetear contraseña"
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50">
                              <Key size={14} /> Resetear
                            </button>
                            <button onClick={() => handleToggleActivo(u)} disabled={enAccion}
                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors disabled:opacity-50
                                      ${u.activo 
                                        ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200' 
                                        : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50'
                                      }`}
                            >
                              {enAccion ? <Loader2 size={14} className="animate-spin" /> : (u.activo ? <UserX size={14} /> : <UserCheck size={14} />)}
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={filtros.page} 
              totalPages={totalPages} 
              onPageChange={(newPage) => handleFiltro('page', newPage)} 
            />
          </div>
        )}
      </div>

      {/* Modal para Crear Trabajador */}
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
      err.correo = 'Formato de correo inválido'
    }
    if (!form.passwordInicial) {
      err.passwordInicial = 'La contraseña inicial es obligatoria'
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.passwordInicial)) {
      err.passwordInicial = 'Debe tener mín. 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Crear Trabajador</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 text-xs font-medium text-teal-800 dark:text-teal-300 rounded-xl flex gap-3 shadow-sm">
            <HardHat size={24} className="text-teal-500 shrink-0" />
            <p>
              Esta cuenta se creará exclusivamente con el rol <strong>TRABAJADOR</strong>. 
              Permite al personal acceder directamente al Panel Operativo (Kanban, Lotes y Mermas) sin requerir registro público.
            </p>
          </div>

          <div className="space-y-4">
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

            <div>
              <Input
                label="Contraseña inicial"
                name="passwordInicial"
                type="text"
                required
                value={form.passwordInicial}
                onChange={handleChange}
                placeholder="Ej: Plantopolis2026!"
                error={errores.passwordInicial}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                Mínimo 8 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">@$!%*?&</code>
              </p>
            </div>
          </div>

          {errorBackend && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorBackend}</span>
            </div>
          )}

          {/* MODAL FOOTER */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {guardando ? 'Creando...' : 'Crear Trabajador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}