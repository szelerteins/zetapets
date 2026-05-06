/**
 * lib/store/users.js — Base de datos de usuarios en memoria
 *
 * IMPORTANTE:
 * - En producción reemplazar por: prisma.user.findUnique / create
 * - Las contraseñas NUNCA se guardan en texto plano → usar bcrypt
 * - En Vercel (serverless) este array se resetea entre invocaciones frías.
 *   Para persistencia real: PostgreSQL, MongoDB, PlanetScale, etc.
 *
 * MIGRACIÓN FUTURA:
 *   npm install @prisma/client prisma bcryptjs
 *   schema.prisma → model User { id, nombre, apellido, email, passwordHash, createdAt }
 */

// Usuarios pre-cargados (simulados)
const users = [
  {
    id: 1,
    nombre: "Demo",
    apellido: "Usuario",
    email: "demo@zetapets.com",
    // En producción: hash bcrypt de la contraseña
    password: "demo1234",
    createdAt: new Date("2026-01-15").toISOString(),
  },
]

let nextId = 2

/** Buscar usuario por email */
export function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

/** Buscar usuario por ID */
export function findUserById(id) {
  return users.find((u) => u.id === Number(id)) ?? null
}

/** Crear nuevo usuario */
export function createUser({ nombre, apellido, email, password }) {
  if (findUserByEmail(email)) {
    return { ok: false, error: "Ya existe una cuenta con ese email" }
  }
  const user = {
    id: nextId++,
    nombre,
    apellido,
    email: email.toLowerCase(),
    password, // FUTURO: await bcrypt.hash(password, 10)
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  return { ok: true, user }
}

/** Verificar contraseña */
export function verifyPassword(user, password) {
  // FUTURO: return await bcrypt.compare(password, user.passwordHash)
  return user.password === password
}

/** Datos públicos del usuario (sin contraseña) */
export function publicUser(user) {
  const { password, ...pub } = user
  return pub
}
