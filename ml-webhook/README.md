# ZetaPets — Webhook Mercado Libre → Google Sheets

## Setup

### 1. Instalar dependencias
```bash
cd ml-webhook
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con las credenciales reales
```

### 3. Obtener Access Token de ML
```bash
node authorize.js
```
Seguir las instrucciones en pantalla. Copiar los tokens al `.env`.

### 4. Iniciar servidor local (para testing)
```bash
npm run dev
```

### 5. Exponer con ngrok (testing local)
```bash
ngrok http 3000
# Usar la URL https://xxxx.ngrok.io como base para el webhook
```

### 6. Registrar webhook en ML
```bash
node registerWebhook.js https://tu-url-publica
```

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `ML_CLIENT_ID` | App ID del portal de desarrolladores ML |
| `ML_CLIENT_SECRET` | Client Secret de la app ML |
| `ML_ACCESS_TOKEN` | Token de acceso (generado con authorize.js) |
| `ML_REFRESH_TOKEN` | Refresh token (generado con authorize.js) |
| `ML_SELLER_ID` | User ID de la cuenta vendedora ML |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la service account de GCP |
| `GOOGLE_PRIVATE_KEY` | Clave privada de la service account |
| `GOOGLE_SHEET_ID` | ID del Google Sheet de ZetaPets |

## Estructura de archivos

```
ml-webhook/
├── index.js           # Servidor Express (punto de entrada)
├── mlClient.js        # Consultas a la API de ML
├── sheetsClient.js    # Escritura en Google Sheets
├── skuMapper.js       # Mapeo título ML → SKU interno
├── authorize.js       # Script para obtener tokens OAuth
├── registerWebhook.js # Script para registrar suscripción ML
├── .env.example       # Template de variables
└── package.json
```
