# 🚚 SuperEconómico - Sistema Administrativo y Logístico (Honduras)

Panel de administración, gestión de pedidos, choferes, productos, finanzas y soporte técnico para la plataforma **SuperEconómico**, completamente integrado con **Supabase Cloud**.

---

## ⚡ Conexión Directa con Supabase

Este proyecto está configurado para conectarse directamente al backend de Supabase utilizado por la aplicación Android (`com.uth.supereconomico`):

- **Supabase URL**: `https://mvrlcbcydpubhovvrmvf.supabase.co`
- **Tablas Sincronizadas**:
  - `productos` / `inventory`
  - `pedidos` / `orders`
  - `perfiles` / `drivers`
  - `logs_errores` / `tickets`
  - `calendar_events` & `financial_metrics`

---

## 🛠️ Cómo Abrir y Ejecutar el Proyecto

Este repositorio es totalmente compatible tanto para trabajar en **Visual Studio Code** como en **Google Antigravity / AI Studio**.

### 1️⃣ Clonar o Descargar el Repositorio
```bash
git clone <URL_DE_TU_REPOSUTORIO_GITHUB>
cd supereconomico-admin
```

### 2️⃣ Instalar Dependencias
```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Contenido por defecto en `.env`:
```env
VITE_SUPABASE_URL="https://mvrlcbcydpubhovvrmvf.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmxjYmN5ZHB1YmhvdnZybXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA3OTAsImV4cCI6MjA5ODMxNjc5MH0.rNQq1xOA5zGJpMiHlhsXKw5lWLg49qYUtDSC9M7Iha8"
```

### 4️⃣ Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Pasos para Subir este Proyecto a GitHub (Público)

Si deseas subir el repositorio desde la terminal de tu equipo o servidor:

1. Crea un nuevo repositorio público en GitHub (por ejemplo, `supereconomico-admin`).
2. En tu terminal ejecuta:
```bash
git init
git add .
git commit -m "Initial commit - SuperEconómico Admin con conexión Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/supereconomico-admin.git
git push -u origin main
```

> 💡 **Nota**: También puedes usar la función **"Export to GitHub"** ubicada en el menú de ajustes de **Google AI Studio** para sincronizar este proyecto directamente con tu cuenta de GitHub con un solo clic.

---

## 💻 Compatibilidad IDEs
- **Visual Studio Code**: Incluye la carpeta `.vscode/` con tareas (`tasks.json`) para ejecutar `npm run dev` con un clic (`Ctrl+Shift+B` / `Cmd+Shift+B`).
- **Google Antigravity / AI Studio**: Totalmente compatible con recarga automática, compilador TypeScript sin errores y servidor Express integrado en puerto 3000.
