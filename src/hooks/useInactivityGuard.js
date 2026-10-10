import { useCallback, useEffect, useRef, useState } from 'react'

const EVENTOS_ACTIVIDAD = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
const CHEQUEO_MS = 1000

export function useInactivityGuard({ enabled, lockAfterMs, logoutAfterMs, onLogout }) {
  // Inicializar leyendo de localStorage por si se recargó la página
  const getInitialLocked = () => localStorage.getItem('plantopolis_is_locked') === 'true'
  const getInitialActivity = () => {
    const saved = localStorage.getItem('plantopolis_last_activity')
    return saved ? parseInt(saved, 10) : Date.now()
  }

  const [locked, setLockedState] = useState(getInitialLocked)
  const [intervalKey, setIntervalKey] = useState(0)

  const lockedRef = useRef(getInitialLocked())
  const lastActivityRef = useRef(getInitialActivity())
  const loggedOutRef = useRef(false)
  const onLogoutRef = useRef(onLogout)

  const setLocked = useCallback((isLocked) => {
    setLockedState(isLocked)
    if (isLocked) {
      localStorage.setItem('plantopolis_is_locked', 'true')
    } else {
      localStorage.removeItem('plantopolis_is_locked')
    }
  }, [])

  useEffect(() => { lockedRef.current = locked }, [locked])
  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])

  // Escuchar cambios de localStorage en otras pestañas
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'plantopolis_last_activity' && e.newValue) {
        lastActivityRef.current = parseInt(e.newValue, 10)
      }
      if (e.key === 'plantopolis_is_locked') {
        const isLocked = e.newValue === 'true'
        if (isLocked !== lockedRef.current) {
          setLockedState(isLocked)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Registra actividad — limitamos la escritura en localStorage a 1 vez por segundo
  const registrarActividad = useCallback(() => {
    if (lockedRef.current) return
    const now = Date.now()
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now
      localStorage.setItem('plantopolis_last_activity', now.toString())
    }
  }, [])

  // Se llama al desbloquear con éxito
  const unlock = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    localStorage.setItem('plantopolis_last_activity', now.toString())
    loggedOutRef.current = false
    setLocked(false)
    setIntervalKey(k => k + 1) // Forzar reinicio
  }, [setLocked])

  // Arranca/detiene el intervalo
  useEffect(() => {
    if (!enabled) {
      setLocked(false)
      loggedOutRef.current = false
      localStorage.removeItem('plantopolis_is_locked')
      localStorage.removeItem('plantopolis_last_activity')
      return undefined
    }

    // Ya no reseteamos a Date.now() al iniciar (así mantenemos el estado tras F5)
    loggedOutRef.current = false

    const intervalo = setInterval(() => {
      const inactivoMs = Date.now() - lastActivityRef.current

      if (inactivoMs >= logoutAfterMs) {
        if (!loggedOutRef.current) {
          loggedOutRef.current = true
          onLogoutRef.current?.()
        }
        return
      }

      if (inactivoMs >= lockAfterMs) {
        if (!lockedRef.current) {
          setLocked(true)
        }
      }
    }, CHEQUEO_MS)

    return () => clearInterval(intervalo)
  }, [enabled, lockAfterMs, logoutAfterMs, intervalKey, setLocked])

  // Event listeners
  useEffect(() => {
    if (!enabled) return undefined
    EVENTOS_ACTIVIDAD.forEach(evento =>
      window.addEventListener(evento, registrarActividad, { passive: true })
    )
    return () => {
      EVENTOS_ACTIVIDAD.forEach(evento =>
        window.removeEventListener(evento, registrarActividad)
      )
    }
  }, [enabled, registrarActividad])

  return { locked, unlock }
}