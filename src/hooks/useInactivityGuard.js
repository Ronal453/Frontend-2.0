import { useCallback, useEffect, useRef, useState } from 'react'

// Eventos que cuentan como "actividad" del usuario
const EVENTOS_ACTIVIDAD = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

// Evita reiniciar los temporizadores en cada pixel de mousemove
const THROTTLE_MS = 1000

/**
 * Hook de bloqueo por inactividad.
 *
 * - A los `lockAfterMs` de inactividad → bloquea la pantalla (locked = true).
 * - A los `logoutAfterMs` de inactividad, contados desde la MISMA última
 *   actividad (no desde el bloqueo) → dispara `onLogout`.
 *
 * Mientras está bloqueada, la actividad global se ignora: mover el mouse
 * sobre la pantalla de bloqueo NO reinicia el conteo. Solo un `unlock()`
 * exitoso (contraseña correcta) reinicia ambos temporizadores.
 */
export function useInactivityGuard({ enabled, lockAfterMs, logoutAfterMs, onLogout }) {
  const [locked, setLocked] = useState(false)

  const lockTimerRef = useRef(null)
  const logoutTimerRef = useRef(null)
  const lockedRef = useRef(false)
  const lastResetRef = useRef(0)
  const onLogoutRef = useRef(onLogout)

  useEffect(() => { lockedRef.current = locked }, [locked])
  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])

  const clearTimers = useCallback(() => {
    clearTimeout(lockTimerRef.current)
    clearTimeout(logoutTimerRef.current)
  }, [])

  const armTimers = useCallback(() => {
    clearTimers()
    lockTimerRef.current = setTimeout(() => setLocked(true), lockAfterMs)
    logoutTimerRef.current = setTimeout(() => {
      clearTimers()
      onLogoutRef.current?.()
    }, logoutAfterMs)
  }, [clearTimers, lockAfterMs, logoutAfterMs])

  const resetActivity = useCallback(() => {
    if (lockedRef.current) return // bloqueado: no reinicia nada
    const ahora = Date.now()
    if (ahora - lastResetRef.current < THROTTLE_MS) return
    lastResetRef.current = ahora
    armTimers()
  }, [armTimers])

  // Se llama tras validar la contraseña correctamente en la pantalla de bloqueo
  const unlock = useCallback(() => {
    lastResetRef.current = Date.now()
    setLocked(false)
    armTimers()
  }, [armTimers])

  // Arranca/detiene todo según haya o no sesión activa
  useEffect(() => {
    if (!enabled) {
      clearTimers()
      setLocked(false)
      return undefined
    }
    armTimers()
    return clearTimers
  }, [enabled, armTimers, clearTimers])

  // Escucha global de actividad (solo con sesión iniciada)
  useEffect(() => {
    if (!enabled) return undefined
    EVENTOS_ACTIVIDAD.forEach(evento =>
      window.addEventListener(evento, resetActivity, { passive: true })
    )
    return () => {
      EVENTOS_ACTIVIDAD.forEach(evento =>
        window.removeEventListener(evento, resetActivity)
      )
    }
  }, [enabled, resetActivity])

  return { locked, unlock }
}