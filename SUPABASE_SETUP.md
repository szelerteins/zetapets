# Integración Supabase — ZetaPets

## 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir nombre: `zetapets`, contraseña fuerte, región: **South America (São Paulo)**
3. Esperar que termine de crearse (~2 min)

---

## 2. Obtener las claves del proyecto

Ir a **Settings → API**:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API Keys → anon / public" |

Copiar ambas y pegarlas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Y también en **Vercel → Settings → Environment Variables**.

---

## 3. Ejecutar las migraciones (en orden)

Ir a **Supabase Dashboard → SQL Editor → New query**.

Copiar y ejecutar cada archivo en orden:

### Paso 1 — Crear tablas
```
supabase/migrations/001_create_tables.sql
```

### Paso 2 — Triggers
```
supabase/migrations/002_triggers.sql
```

### Paso 3 — RLS Policies
```
supabase/migrations/003_rls_policies.sql
```

---

## 4. Ejecutar el seed de productos

En **SQL Editor**, ejecutar:
```
supabase/seed.sql
```
Esto carga 19 productos de ejemplo en la tabla `products`.

---

## 5. Configurar autenticación

En **Supabase → Authentication → Settings**:

- **Site URL**: `https://tu-proyecto.vercel.app`
- **Redirect URLs**: agregar `https://tu-proyecto.vercel.app/**`
- En desarrollo local: agregar también `http://localhost:3000/**`

---

## 6. Crear el primer administrador

Después de que alguien se registre en la página, obtener su UUID de:
**Authentication → Users** → copiar el ID del usuario.

Luego ejecutar en SQL Editor:
```sql
INSERT INTO public.admin_users (user_id)
VALUES ('uuid-del-usuario-aqui');
```

---

## Modelo relacional

```
auth.users (Supabase)
  ├── profiles (1:1) — nombre, teléfono, dirección
  ├── orders (1:N) — cada compra
  │     └── order_items (1:N) — cada producto en la compra
  └── admin_users (1:1, opcional) — marca al usuario como admin
  
products — catálogo de productos (RLS: todos pueden leer, solo admin escribe)
```

---

## RLS Policies

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `profiles` | Solo el dueño + admins | Solo el dueño |
| `products` | Todos (solo activos) | Solo admins |
| `orders` | Solo el dueño + admins | Usuario autenticado |
| `order_items` | Solo si la orden es propia + admins | Usuario autenticado |
| `admin_users` | Solo admins | Nadie (insert manual) |

---

## Flujo de usuario

### Registro
1. Usuario completa `/register` → Supabase Auth crea el usuario
2. El trigger `handle_new_user()` crea el `profile` automáticamente
3. Usuario queda autenticado

### Login
1. Usuario completa `/login` → Supabase valida email + password
2. JWT se guarda en cookie httpOnly automáticamente
3. Sesión persiste hasta que el usuario cierra sesión

### Compra
1. Usuario agrega productos al carrito (localStorage)
2. Completa el formulario de checkout
3. `CartContext.placeOrder()` guarda la orden en Supabase:
   - Inserta en `orders`
   - Inserta en `order_items`
4. El carrito se limpia

### Historial
- Usuario va a `/orders` → ve todas sus compras con estado y detalle

---

## Probar localmente

```bash
# Clonar e instalar
npm install

# Copiar variables de entorno
cp .env.local.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# Correr en desarrollo
npm run dev
```

1. Ir a `http://localhost:3000/register` → crear cuenta
2. Ir a `http://localhost:3000/productos` → agregar al carrito
3. Ir a `http://localhost:3000/checkout` → completar compra
4. Ir a `http://localhost:3000/orders` → ver historial
5. Ir a `http://localhost:3000/account` → editar perfil
