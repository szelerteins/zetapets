# ZetaPets — E-commerce de productos inteligentes para mascotas

Tienda online construida con **Next.js 15 App Router**, **Supabase** y **Mercado Pago**.

---

## Requisitos

- Node.js 18+
- npm 9+
- Cuenta en Supabase
- Cuenta de Mercado Pago (con credenciales de prueba y producción)

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/<usuario>/zetapets.git
cd zetapets

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores reales (ver sección Variables de entorno)

# 4. Correr en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

Copiar `.env.local.example` a `.env.local` y completar cada variable.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo servidor) |
| `MERCADOPAGO_SANDBOX_ACCESS_TOKEN` | Token TEST-xxx de prueba |
| `MERCADOPAGO_ACCESS_TOKEN` | Token APP_USR-xxx de producción |
| `MP_SANDBOX` | `true` en local/staging, `false` en producción |
| `ADMIN_SESSION_SECRET` | String aleatorio de 64 chars para firmar sesiones |
| `ADMIN_USERNAME` | Usuario del panel admin |
| `ADMIN_PASSWORD` | Contraseña del panel admin |
| `NEXT_PUBLIC_APP_URL` | URL pública (`http://localhost:3000` en local) |
| `GMAIL_USER` | Email Gmail para notificaciones |
| `GMAIL_APP_PASSWORD` | App Password de Gmail |
| `GROQ_API_KEY` | API key de Groq para el chatbot |

---

## Mercado Pago — Modo sandbox

El proyecto separa credenciales de sandbox y producción:

- **Desarrollo/testing**: configurar `MP_SANDBOX=true` + `MERCADOPAGO_SANDBOX_ACCESS_TOKEN=TEST-xxx`
- **Producción**: configurar `MP_SANDBOX=false` + `MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx` en Vercel

Las credenciales de prueba se obtienen en [mercadopago.com.ar → Developers → Credenciales de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/accounts).

---

## Seguridad del panel admin

La sesión del admin se firma con HMAC-SHA256 usando `ADMIN_SESSION_SECRET`.  
La cookie contiene un token del tipo `admin|<timestamp>|<firma-hex>`, que no puede ser forjado  
sin conocer el secreto. Verificado tanto en el middleware (Edge Runtime) como en las API routes.

Generar un secreto seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts disponibles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npm test` | Ejecutar pruebas unitarias |

---

## CI/CD con GitHub Actions

El workflow `.github/workflows/ci.yml` se ejecuta automáticamente en cada push a `main` o `develop`, y en Pull Requests a `main`.

**Pasos del pipeline:**
1. `npm ci` — instala dependencias reproducibles
2. `npm run lint` — valida el código con ESLint
3. `npm test` — ejecuta las pruebas unitarias
4. `npm run build` — verifica que el build compila sin errores

**Configuración de secretos en GitHub:**
1. Ir a `Settings → Secrets and variables → Actions`
2. Agregar cada variable de entorno listada arriba como Secret

---

## Flujo de trabajo con ramas y Pull Requests

Para cumplir con buenas prácticas de CI/CD:

```
main              ← producción (solo se mergea desde develop o hotfixes)
  └── develop     ← integración (base para features)
        └── feature/nueva-funcionalidad   ← trabajo diario
        └── fix/nombre-del-bug
        └── hotfix/urgente                ← directamente desde main si es urgente
```

**Proceso recomendado:**

1. Crear rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mi-funcionalidad
   ```

2. Desarrollar y commitear con mensajes descriptivos:
   ```bash
   git commit -m "feat: agrego validación de teléfono argentino"
   git commit -m "fix: corregir webhook de Mercado Pago para pagos rechazados"
   ```

3. Push y abrir Pull Request hacia `develop`:
   ```bash
   git push origin feature/mi-funcionalidad
   # Abrir PR en GitHub → base: develop
   ```

4. El CI/CD se ejecuta automáticamente. Si pasa lint + tests + build, se puede mergear.

5. Al tener suficientes cambios listos, abrir PR de `develop → main` para deployar a producción.

**Reglas de PR sugeridas (configurar en GitHub → Settings → Branches):**
- Require status checks to pass before merging (CI workflow)
- Require at least 1 review
- No push directo a `main` sin PR

---

## Tests

Las pruebas están en `__tests__/validations.test.js` y cubren:

- Validación de nombre (rechaza números, símbolos, campo vacío, longitud mínima)
- Validación de teléfono (rechaza letras, símbolos sin dígitos, longitud insuficiente)
- Validación del formulario de contacto
- Mapeo de estados del webhook de Mercado Pago
- Verificación estructural del token de sesión admin

```bash
npm test
```

---

## Estructura del proyecto

```
zetapets/
├── app/
│   ├── api/
│   │   ├── auth/login/       # Login admin (token HMAC)
│   │   ├── payments/webhook/ # Webhook MP (todos los estados)
│   │   ├── chat/             # Chatbot (restringido a ZetaPets)
│   │   └── contact/          # Formulario de contacto (validado con Zod)
│   ├── admin/                # Panel de administración
│   ├── checkout/             # Proceso de compra
│   └── ...
├── components/
│   └── CheckoutSteps.jsx     # Formulario multi-paso con validación Zod
├── lib/
│   ├── admin-session.js      # HMAC signing/verification de sesión admin
│   ├── mercadopago.js        # Cliente MP con soporte sandbox/producción
│   └── validations.js        # Esquemas Zod compartidos
├── __tests__/
│   └── validations.test.js   # Pruebas unitarias
├── .github/workflows/ci.yml  # Pipeline CI/CD
└── middleware.js              # Protección de rutas con token firmado
```
