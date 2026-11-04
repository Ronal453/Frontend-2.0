/**
 * Suite de pruebas unitarias e integrales de arquitectura para el Frontend de Plantopolis.
 * Ejecutable directamente con el runner nativo de Node.js (`node --test src/test/frontend.test.js`).
 *
 * Cubre los siguientes pilares críticos de calidad:
 * 1. Simetría 100% e integridad de los diccionarios de internacionalización (`es.js` y `en.js`),
 *    ausencia de claves duplicadas en el código fuente y verificación de claves críticas.
 * 2. Motor de traducción e interpolación `t()` (`createTranslator` / `LanguageContext.jsx`),
 *    incluyendo soporte de parámetros `{variable}` con 2 y 3 argumentos y garantía de retorno string.
 * 3. Utilidades de sesión y JWT (`jwt.js`), verificando resiliencia ante JSON corrupto en `localStorage`,
 *    decodificación Base64URL y validación de expiración.
 * 4. Máquina de estados del tablero Kanban (`tareasConstantes.js`), validando todas las transiciones
 *    permitidas y prohibidas alineadas con `EstadoTarea.java` del Backend.
 */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { es } from '../locales/es.js'
import { en } from '../locales/en.js'
import { createTranslator } from '../locales/translations.js'
import {
  guardarUsuario,
  obtenerUsuario,
  eliminarUsuario,
  haySession,
  decodificarToken,
  estaTokenExpirado,
} from '../utils/jwt.js'
import {
  DESTINOS_VALIDOS,
  esTransicionValida,
  formatFecha,
  extraerTituloYDescripcion,
} from '../components/tareas/tareasConstantes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extrae todas las claves literales definidas en un archivo de diccionario (`es.js` o `en.js`)
 * leyendo el código fuente línea por línea para detectar posibles claves duplicadas que JavaScript
 * sobrescribiría silenciosamente en tiempo de ejecución.
 *
 * @param {string} relativeFilePath - Ruta relativa al archivo de locale desde `src/test`
 * @returns {string[]} Lista de todas las claves declaradas en el archivo fuente
 */
function extractSourceKeys(relativeFilePath) {
  const fullPath = path.resolve(__dirname, relativeFilePath)
  const content = fs.readFileSync(fullPath, 'utf-8')
  const keyRegex = /^\s*['"]([^'"]+)['"]\s*:/gm
  const keys = []
  let match
  while ((match = keyRegex.exec(content)) !== null) {
    keys.push(match[1])
  }
  return keys
}

/**
 * Crea un token JWT sintético (header.payload.signature) codificado en Base64URL
 * para pruebas unitarias de decodificación y expiración sin depender de librerías externas.
 *
 * @param {Record<string, any>} payload - Objeto de claims del JWT (ej. `sub`, `rol`, `exp`)
 * @returns {string} Token JWT formateado en tres segmentos
 */
function crearJwtPrueba(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.firma_simulada`
}

/**
 * 1. Suite de pruebas de Internacionalización (i18n): Simetría e Integridad de Diccionarios.
 */
describe('1. Internacionalización (i18n) — Simetría 100% entre es.js y en.js', () => {
  it('debe tener exactamente el mismo conjunto de claves en español (es) e inglés (en)', () => {
    const esKeys = Object.keys(es)
    const enKeys = Object.keys(en)

    const missingInEn = esKeys.filter((k) => !(k in en))
    const missingInEs = enKeys.filter((k) => !(k in es))

    assert.deepEqual(
      missingInEn,
      [],
      `Claves presentes en es.js pero faltantes en en.js: ${missingInEn.join(', ')}`
    )
    assert.deepEqual(
      missingInEs,
      [],
      `Claves presentes en en.js pero faltantes en es.js: ${missingInEs.join(', ')}`
    )
    assert.equal(esKeys.length, enKeys.length, 'El número total de claves debe coincidir exactamente')
  })

  it('no debe contener valores vacíos ni tipos distintos de string en ningún diccionario', () => {
    for (const [key, value] of Object.entries(es)) {
      assert.equal(typeof value, 'string', `El valor de '${key}' en es.js no es un string`)
      assert.ok(value.trim().length > 0, `La clave '${key}' en es.js tiene un valor vacío`)
    }
    for (const [key, value] of Object.entries(en)) {
      assert.equal(typeof value, 'string', `El valor de '${key}' en en.js no es un string`)
      assert.ok(value.trim().length > 0, `La clave '${key}' en en.js tiene un valor vacío`)
    }
  })

  it('no debe tener claves duplicadas en el archivo fuente de es.js ni en.js', () => {
    const esSourceKeys = extractSourceKeys('../locales/es.js')
    const enSourceKeys = extractSourceKeys('../locales/en.js')

    const findDuplicates = (arr) => arr.filter((item, idx) => arr.indexOf(item) !== idx)

    assert.deepEqual(
      findDuplicates(esSourceKeys),
      [],
      `Se encontraron claves duplicadas en es.js: ${findDuplicates(esSourceKeys).join(', ')}`
    )
    assert.deepEqual(
      findDuplicates(enSourceKeys),
      [],
      `Se encontraron claves duplicadas en en.js: ${findDuplicates(enSourceKeys).join(', ')}`
    )
  })

  it('debe incluir todas las claves críticas requeridas por los módulos de la aplicación', () => {
    const requiredKeys = [
      'admin.supplier',
      'catalog.currency',
      'admin.errorLoad',
      'common.retry',
      'common.refresh',
      'cart.requiredField',
      'cart.invalidPrice',
      'checkout.paymentTransfer',
      'orders.errorLoadDetail',
      'admin.errorLoadingZones',
      'admin.errorChangingZoneStatus',
      'admin.errorSavingZone',
      'admin.errorLoadingBatchesInZone',
    ]

    for (const key of requiredKeys) {
      assert.ok(key in es, `Falta la clave crítica '${key}' en es.js`)
      assert.ok(key in en, `Falta la clave crítica '${key}' en en.js`)
    }
  })
})

/**
 * 2. Suite de pruebas del motor de traducción e interpolación `t()`.
 */
describe('2. Motor de traducción e interpolación t() (LanguageContext / translations)', () => {
  const tEs = createTranslator('es')
  const tEn = createTranslator('en')

  it('debe interpolar correctamente variables dinámicas como {current}, {total}, {count} y {email}', () => {
    const pageEs = tEs('common.page_info', { current: 2, total: 5 })
    const pageEn = tEn('common.page_info', { current: 2, total: 5 })
    assert.equal(pageEs, 'Página 2 de 5')
    assert.equal(pageEn, 'Page 2 of 5')

    const stockEs = tEs('catalog.stock', { count: 8 })
    assert.ok(!stockEs.includes('{count}'))
    assert.equal(stockEs, 'Stock: 8 unid.')

    const lockDescEs = tEs('lock.desc', { email: 'operario@plantopolis.com' })
    assert.ok(lockDescEs.includes('operario@plantopolis.com'))
    assert.ok(!lockDescEs.includes('{email}'))
  })

  it('debe soportar llamada con 2 argumentos (clave + fallback string) cuando la clave no existe', () => {
    const resultado = tEs('clave.inexistente.prueba', 'Texto de respaldo')
    assert.equal(resultado, 'Texto de respaldo')
  })

  it('debe soportar llamada con 3 argumentos (clave + objeto de parámetros + fallback string)', () => {
    const existente = tEs('common.page_info', { current: 1, total: 3 }, 'Página {current} de {total}')
    assert.equal(existente, 'Página 1 de 3')

    const inexistente = tEs('clave.no.existe', { count: 7 }, 'Total elementos: {count}')
    assert.equal(inexistente, 'Total elementos: 7')
  })

  it('nunca debe retornar un objeto (prevención de crash en React al pasar objeto como 2do argumento sin 3er argumento)', () => {
    const resultado = tEs('clave.inexistente.con.objeto', { current: 1, total: 10 })
    assert.equal(typeof resultado, 'string', 'El retorno de t() siempre debe ser un string primitivo')
    assert.equal(resultado, 'objeto')
  })

  it('debe resolver alias cruzados entre orderStatus.* y status.*', () => {
    const statusEs = tEs('orderStatus.PENDIENTE')
    assert.equal(typeof statusEs, 'string')
    assert.notEqual(statusEs, 'orderStatus.PENDIENTE')
  })
})

/**
 * 3. Suite de pruebas de utilidades de JWT y resiliencia de sesión en localStorage.
 */
describe('3. Utilidades JWT y almacenamiento de sesión (jwt.js)', () => {
  /**
   * Mock ligero de localStorage en memoria para entorno Node.js.
   */
  beforeEach(() => {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    }
  })

  it('debe guardar, obtener, verificar sesión y eliminar el usuario correctamente', () => {
    assert.equal(haySession(), false)
    assert.equal(obtenerUsuario(), null)

    const mockUser = { token: 'jwt.token.valido', email: 'admin@plantopolis.com', rol: 'ADMINISTRADOR' }
    guardarUsuario(mockUser)

    assert.equal(haySession(), true)
    assert.deepEqual(obtenerUsuario(), mockUser)

    eliminarUsuario()
    assert.equal(haySession(), false)
    assert.equal(obtenerUsuario(), null)
  })

  it('debe recuperarse sin lanzar excepción si localStorage contiene JSON corrupto y limpiar la clave dañada', () => {
    globalThis.localStorage.setItem('user', '{json_corrupto_invalido')

    let resultado
    assert.doesNotThrow(() => {
      resultado = obtenerUsuario()
    }, 'obtenerUsuario() no debe propagar SyntaxError cuando el JSON está corrupto')

    assert.equal(resultado, null)
    assert.equal(
      globalThis.localStorage.getItem('user'),
      null,
      'La entrada corrupta debe eliminarse automáticamente de localStorage'
    )
    assert.equal(haySession(), false)
  })

  it('debe decodificar tokens JWT válidos y detectar correctamente si están expirados o vigentes', () => {
    const futuroExp = Math.floor(Date.now() / 1000) + 3600
    const pasadoExp = Math.floor(Date.now() / 1000) - 3600

    const tokenVigente = crearJwtPrueba({ sub: 'trabajador@plantopolis.com', rol: 'TRABAJADOR', exp: futuroExp })
    const tokenExpirado = crearJwtPrueba({ sub: 'trabajador@plantopolis.com', rol: 'TRABAJADOR', exp: pasadoExp })

    const payload = decodificarToken(tokenVigente)
    assert.equal(payload.sub, 'trabajador@plantopolis.com')
    assert.equal(payload.rol, 'TRABAJADOR')

    assert.equal(estaTokenExpirado(tokenVigente), false)
    assert.equal(estaTokenExpirado(tokenExpirado), true)
    assert.equal(estaTokenExpirado('token_malformado'), true)
    assert.equal(estaTokenExpirado(null), true)
  })
})

/**
 * 4. Suite de pruebas de la Máquina de Estados de Tareas Operativas (Kanban).
 */
describe('4. Máquina de Estados del Tablero Kanban (tareasConstantes.js)', () => {
  it('debe permitir todas las transiciones válidas definidas en las reglas de negocio', () => {
    const transicionesValidas = [
      ['POR_HACER', 'EN_PROGRESO'],
      ['POR_HACER', 'BLOQUEADA'],
      ['EN_PROGRESO', 'POR_HACER'],
      ['EN_PROGRESO', 'EN_REVISION'],
      ['EN_PROGRESO', 'BLOQUEADA'],
      ['EN_REVISION', 'EN_PROGRESO'],
      ['EN_REVISION', 'COMPLETADA'],
      ['EN_REVISION', 'BLOQUEADA'],
      ['BLOQUEADA', 'POR_HACER'],
      ['BLOQUEADA', 'EN_PROGRESO'],
    ]

    for (const [origen, destino] of transicionesValidas) {
      assert.equal(
        esTransicionValida(origen, destino),
        true,
        `La transición ${origen} -> ${destino} debería ser válida`
      )
    }
  })

  it('debe rechazar transiciones prohibidas, saltos de fase y salidas desde COMPLETADA', () => {
    const transicionesInvalidas = [
      ['POR_HACER', 'EN_REVISION'],
      ['POR_HACER', 'COMPLETADA'],
      ['EN_PROGRESO', 'COMPLETADA'],
      ['BLOQUEADA', 'EN_REVISION'],
      ['BLOQUEADA', 'COMPLETADA'],
      ['COMPLETADA', 'POR_HACER'],
      ['COMPLETADA', 'EN_PROGRESO'],
      ['COMPLETADA', 'EN_REVISION'],
      ['COMPLETADA', 'BLOQUEADA'],
      ['POR_HACER', 'POR_HACER'],
      ['EN_PROGRESO', 'EN_PROGRESO'],
      [null, 'EN_PROGRESO'],
      ['POR_HACER', null],
      ['ESTADO_INEXISTENTE', 'EN_PROGRESO'],
    ]

    for (const [origen, destino] of transicionesInvalidas) {
      assert.equal(
        esTransicionValida(origen, destino),
        false,
        `La transición ${origen} -> ${destino} debería ser rechazada`
      )
    }

    assert.deepEqual(DESTINOS_VALIDOS.COMPLETADA, [], 'COMPLETADA debe ser un estado terminal sin destinos')
  })

  it('debe formatear fechas de API (ISO string, array Jackson y objeto) y separar título/descripción', () => {
    assert.equal(formatFecha('2026-04-19T14:30:00'), '2026-04-19')
    assert.equal(formatFecha([2026, 4, 9]), '2026-04-09')
    assert.equal(formatFecha({ year: 2026, monthValue: 11, dayOfMonth: 5 }), '2026-11-05')
    assert.equal(formatFecha(null, 'Sin fecha'), 'Sin fecha')

    const compuesta = extraerTituloYDescripcion({
      descripcion: 'Riego matutino - Aplicar 500ml por maceta en zona norte',
    })
    assert.equal(compuesta.titulo, 'Riego matutino')
    assert.equal(compuesta.descripcion, 'Aplicar 500ml por maceta en zona norte')
  })
})
