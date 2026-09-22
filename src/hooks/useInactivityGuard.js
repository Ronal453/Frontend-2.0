import { useCallback, useEffect, useRef, useState } from 'react'

// Eventos que cuentan como "actividad" del usuario
const EVENTOS_ACTIVIDAD = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

// Cada cuánto revisa el tiempo transcurrido desde la última actividad
const CHEQUEO_MS = 1000

/**
 * Hook de bloqueo por inactividad basado en un único setInterval que
 * compara Date.now() contra la última actividad registrada.
 *
 * - A los `lockAfterMs` de inactividad → bloquea la pantalla (locked = true).
 * - A los `logoutAfterMs` de inactividad TOTAL (contados desde la misma
 *   última actividad real, sin importar si está bloqueada o no) → onLogout().
 *
 * Mientras está bloqueada, mover el mouse NO cuenta como actividad
 * (así el contador de logout sigue corriendo). Solo `unlock()` (contraseña
 * correcta) reinicia el conteo.
 */
export function useInactivityGuard({ enabled, lockAfterMs, logoutAfterMs, onLogout }) {
  const [locked, setLocked] = useState(false)

  const lockedRef = useRef(false)
  const lastActivityRef = useRef(Date.now())
  const loggedOutRef = useRef(false)
  const onLogoutRef = useRef(onLogout)

  useEffect(() => { lockedRef.current = locked }, [locked])
  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])

  // Registra actividad — se ignora si ya está bloqueada
  const registrarActividad = useCallback(() => {
    if (lockedRef.current) return
    lastActivityRef.current = Date.now()
  }, [])

  // Se llama al desbloquear con éxito (contraseña correcta)
  const unlock = useCallback(() => {
    lastActivityRef.current = Date.now()
    loggedOutRef.current = false
    setLocked(false)
  }, [])

  // Arranca/detiene el intervalo según haya o no sesión activa
  useEffect(() => {
    if (!enabled) {
      setLocked(false)
      loggedOutRef.current = false
      return undefined
    }

    lastActivityRef.current = Date.now()
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
        setLocked(true)
      }
    }, CHEQUEO_MS)

    return () => clearInterval(intervalo)
  }, [enabled, lockAfterMs, logoutAfterMs])

  // Escucha global de actividad (solo con sesión iniciada)
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