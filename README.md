# 🌿 BeHu — Gestión Financiera Personal Inteligente

> **BeHu** es una aplicación web full-stack de finanzas personales diseñada para brindar claridad, control y bienestar financiero a través de una experiencia minimalista, intuitiva y basada en datos.

Desarrollada con **Next.js 16**, **TypeScript**, **Prisma ORM** y **Neon Serverless PostgreSQL**.

---

## 🌟 Características Principales

- **📊 Dashboard Financiero en Tiempo Real**  
  Vista consolidada de balance total, ingresos del mes, gastos acumulados y tasa de ahorro con gráficos interactivos de distribución de gastos y evolución mensual.

- **💳 Registro y Control de Movimientos**  
  Historial interactivo de ingresos y gastos con filtrado por tipo, categoría, mes y búsqueda por texto. Soporte para múltiples métodos de pago (efectivo, débito, crédito, transferencias).

- **⚖️ Presupuestos y Regla 50/30/20**  
  Clasificación automática de categorías en **Necesidades (50%)**, **Deseos (30%)** y **Ahorro (20%)**, con barras de progreso que alertan cuando se excede el límite mensual presupuestado.

- **🎯 Metas de Ahorro con Seguimiento**  
  Crea objetivos de ahorro con montos objetivo, fechas límite y emojis personalizados. Permite registrar abonos graduales con cálculo automático de progreso porcentual.

- **💡 Insights & Educación Financiera**  
  Motor de recomendaciones que analiza patrones de consumo, detecta gastos desbalanceados y ofrece consejos financieros prácticos y aplicables.

- **🎨 Diseño Minimalista & Sofisticado**  
  Interfaz limpia, libre de saturación visual o gradientes artificiales, con paleta de tonos neutros, tipografía legible y microinteracciones fluidas.

- **🔐 Autenticación y Seguridad Robusta**  
  Manejo de sesiones mediante cookies HTTP-only cifradas (JWT con `jose`), contraseñas encriptadas con `bcryptjs`, capa de acceso a datos (*Data Access Layer*) y middleware de protección de rutas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework Full-Stack** | [Next.js 16](https://nextjs.org/) | App Router, Server Components y Server Actions para rendimiento óptimo |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estático de extremo a extremo |
| **Librería de UI** | [React 19](https://react.dev/) | Componentes interactivos y estados reactivos |
| **Estilos** | CSS Moderno (Vanilla) | Variables semánticas, diseño responsivo y sin dependencias pesadas |
| **Base de Datos** | [Neon PostgreSQL](https://neon.tech/) | PostgreSQL Serverless en la nube con Connection Pooling |
| **ORM** | [Prisma](https://www.prisma.io/) | Modelado de datos, migraciones declarativas y consultas tipadas |
| **Gráficos** | [Recharts](https://recharts.org/) | Visualizaciones de datos responsivas y accesibles |
| **Íconos** | [Lucide React](https://lucide.dev/) | Iconografía limpia y coherente |
| **Despliegue** | [Vercel](https://vercel.com/) | Plataforma de alojamiento optimizada para Next.js |

---

## 📁 Estructura del Proyecto

```text
BeHu/
├── prisma/
│   ├── schema.prisma        # Definición del modelo relacional de la BD
│   ├── seed.ts              # Población de categorías y consejos iniciales
│   ├── create-test-user.ts  # Generador de usuarios de prueba
│   └── test-neon.ts         # Script de validación de conexión a Neon
├── public/                  # Recursos estáticos e imágenes
├── src/
│   ├── actions/             # Server Actions (Mutaciones seguras de BD)
│   │   ├── auth.ts          # Registro, login y logout
│   │   ├── goals.ts         # Creación y aportes a metas
│   │   ├── settings.ts      # Configuración de perfil y categorías
│   │   └── transactions.ts  # Creación y eliminación de movimientos
│   ├── app/                 # Rutas del App Router
│   │   ├── (app)/           # Rutas privadas autenticadas
│   │   │   ├── dashboard/   # Panel principal
│   │   │   ├── transactions/# Historial de transacciones
│   │   │   ├── budgets/     # Gestión de presupuestos
│   │   │   ├── goals/       # Metas de ahorro
│   │   │   ├── insights/    # Diagnóstico y educación financiera
│   │   │   └── settings/    # Preferencias y perfil
│   │   ├── (auth)/          # Rutas públicas de autenticación (login / registro)
│   │   ├── globals.css      # Sistema de diseño y tokens de color
│   │   ├── layout.tsx       # Layout raíz
│   │   └── page.tsx         # Landing page de bienvenida
│   ├── components/          # Componentes reutilizables (Sidebar, Modales, Gráficos)
│   ├── lib/                 # Lógica de negocio y utilidades del servidor
│   │   ├── analytics.ts     # Cálculo de balances, gastos y regla 50/30/20
│   │   ├── dal.ts           # Data Access Layer con verificación de sesión
│   │   ├── insights.ts      # Reglas heurísticas de diagnóstico financiero
│   │   ├── prisma.ts        # Cliente singleton de Prisma
│   │   └── session.ts       # Firma y validación de tokens JWT
│   └── proxy.ts             # Middleware de control de acceso a rutas privadas
├── .env.example             # Plantilla de variables de entorno
├── neon.ts                  # Configuración oficial del servicio Neon
└── package.json
```

---

## 🚀 Instalación y Puesta en Marcha Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v20 o superior
- Administrador de paquetes `npm` (incluido con Node.js)
- Instancia activa de PostgreSQL o Neon

### 1. Clonar el Repositorio
```bash
git clone https://github.com/juandavidbotero242008/Proyecto_FIS2025-3.git
cd Proyecto_FIS2025-3
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto a partir de la plantilla:
```bash
cp .env.example .env
```
Edita `.env` con las credenciales de tu base de datos:
```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@host-pooler/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USUARIO:CONTRASEÑA@host-direct/neondb?sslmode=require"
SESSION_SECRET="cadena-larga-y-segura-para-firmar-sesiones"
```

### 4. Inicializar Base de Datos
Genera el cliente de Prisma, aplica las migraciones y puebla los datos iniciales:
```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar las migraciones a la base de datos
npx prisma migrate deploy

# Poblar categorías predeterminadas y tips
npm run seed
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 👤 Usuarios de Prueba Preconfigurados

Si inicializaste la base de datos con los seeders, puedes ingresar con cualquiera de estas cuentas:

| Usuario | Correo Electrónico | Contraseña | Datos incluidos |
| :--- | :--- | :--- | :--- |
| **Estudiante** | `estudiante@prueba.com` | `Prueba123` | Transacciones universitarias, metas activas y presupuestos |
| **Demo** | `demo@behu.app` | `Demo1234` | Historial amplio de movimientos y categorías personalizadas |

*También puedes registrar un usuario nuevo desde la pantalla de Registro (`/register`).*

---

## 🧪 Pruebas y Validación

El proyecto incluye scripts para validar la integridad del sistema:

```bash
# Probar la conexión completa con la base de datos Neon
npm run test:db

# Compilar para producción (validación de tipos y Server Components)
npm run build
```

---

## ☁️ Despliegue en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com/new).
2. En la sección **Environment Variables**, añade:
   - `DATABASE_URL`: URL del pooler de Neon.
   - `DATABASE_URL_UNPOOLED`: URL de conexión directa de Neon.
   - `SESSION_SECRET`: Cadena segura para JWT.
3. El comando de build configurado en `package.json` (`prisma generate && next build`) asegurará que Prisma se compile automáticamente en cada despliegue.

---

## 📄 Licencia y Créditos

Proyecto desarrollado como parte del curso **FIS 2025-3** (Fundamentos de Ingeniería de Software).  
Diseñado y construido con enfoque en simplicidad, usabilidad y arquitectura de software limpia.
