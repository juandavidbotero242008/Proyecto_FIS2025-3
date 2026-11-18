# 🌿 BeHu — Gestión Financiera Personal y Familiar

> **BeHu** es una plataforma web y PWA (*Progressive Web App*) de bienestar financiero diseñada para transformar la relación de las personas con su dinero. Ayuda a estudiantes, jóvenes y familias a entender en qué se van sus ingresos, frenar compras impulsivas, consolidar metas de ahorro y construir hábitos financieros sólidos a través de datos y acompañamiento inteligente.

---

## 🎯 ¿Para qué sirve BeHu? (El Problema y la Solución)

La mayoría de las personas no sabe con certeza cuánto gasta por semana ni en qué conceptos se diluye su dinero. Las aplicaciones bancarias tradicionales se limitan a mostrar extractos pasivos de movimientos, pero no educan, no previenen el sobreendeudamiento ni fomentan la disciplina.

**BeHu** soluciona esto combinando:
1. **Control y Conciencia:** Registro ágil de ingresos y gastos clasificados bajo la **regla presupuestaria 50/30/20** (Necesidades, Deseos y Ahorro).
2. **Protección del Ahorro (*Saldo Congelado*):** El dinero destinado a una meta se aparta virtualmente del saldo disponible para evitar gastarlo en compras impulsivas.
3. **Gestión Familiar Colaborativa (Senior vs. Junior):** Un esquema donde los acudientes pueden educar, asignar mesadas y configurar topes de gasto preventivos para jóvenes o estudiantes.
4. **Gamificación y Educación Práctica:** Módulos de micro-aprendizaje (*quizzes*) y un Score de Salud Financiera que premia las buenas decisiones monetarias.
5. **Asesoría Contextual:** Asistente interactivo que evalúa los números reales del usuario y ofrece recomendaciones personalizadas sin riesgos de alucinaciones.

---

## 🌟 Funcionalidades Principales

### 📊 1. Dashboard Financiero en Tiempo Real
* Visualización consolidada de balance líquido disponible, ingresos del período, gastos acumulados y capital reservado en metas.
* Gráficos dinámicos de distribución por categorías y seguimiento del comportamiento financiero mensual.
* Indicador en tiempo real del **Score BeHu** (salud crediticia y disciplinaria).

### 💳 2. Historial de Transacciones Inteligente
* Registro de movimientos en menos de 10 segundos indicando monto, fecha, categoría, etiquetas y método de pago (Efectivo, Débito, Crédito, Transferencia).
* Alertas preventivas contra compras impulsivas antes de superar los límites de consumo semanal o diario.
* Filtros avanzados por mes, tipo de movimiento y categorías.

### ⚖️ 3. Presupuestos y Regla 50/30/20
* Clasificación automática del presupuesto mensual:
  * **50% Necesidades:** Vivienda, servicios, alimentación básica, transporte.
  * **30% Deseos:** Restaurantes, ocio, entretenimiento, salidas.
  * **20% Ahorro e Inversión:** Fondo de emergencia, metas y rendimientos.
* Monitoreo visual de límites mensuales con alertas preventivas al alcanzar el 80% y 100% del consumo.

### 🎯 4. Metas de Ahorro y "Saldo Congelado"
* Creación de objetivos con fecha límite y monto deseado (viajes, fondos de emergencia, tecnología).
* Registro de aportes graduales: el dinero aportado pasa a estar **protegido/congelado**, descontándose del saldo disponible para gastar en el día a día.

### 👨‍👩‍👧 5. Gestión Familiar Multi-Rol (Senior & Junior)
* **Rol Senior (Padre / Acudiente):** Administra el patrimonio del hogar, vincula dependientes Junior, define límites semanales o diarios y les transfiere mesadas directamente en la plataforma.
* **Rol Junior (Hijo / Estudiante):** Opera su dinero dentro de márgenes seguros asignados, visualiza su saldo restante para la semana y aprende a administrarse con autonomía.

### 🎓 6. Micro-Learning y Score de Salud Financiera
* Lecciones concisas sobre finanzas personales, manejo de tarjetas de crédito a una sola cuota y fondos de emergencia.
* Quizzes interactivos que otorgan insignias y suman puntos directos al **Score de Salud Financiera (0–100)**.

### 🤖 7. BeHu Mini Assistant (Asistente Inteligente)
* **Sistema Experto Basado en Reglas Sensible al Contexto** (*Context-Aware Rule-Based Expert System*).
* Adapta su asesoría financiera según el rol del usuario:
  * **Para el perfil Senior:** Guía en preservación de capital, CDTs de bajo riesgo y fondos de liquidez familiar.
  * **Para el perfil Junior:** Estrategias para evitar gastos hormiga, cumplir metas a tiempo y respetar límites semanales.
* **Garantías:** Cero alucinaciones, respuestas deterministas en milisegundos y máxima privacidad (los datos bancarios nunca se envían a APIs de terceros).

---

## 🛠️ Arquitectura y Tecnologías Empleadas

* **Framework Full-Stack:** [Next.js 16](https://nextjs.org/) (App Router, Server Components y Server Actions con React 19).
* **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/) de extremo a extremo.
* **Base de Datos:** [Neon Serverless PostgreSQL](https://neon.tech/) con Connection Pooling.
* **ORM:** [Prisma ORM 6](https://www.prisma.io/) para modelado y migraciones declarativas.
* **Estilos y UI:** CSS Moderno Nativo (Design Tokens) con soporte nativo de modo oscuro, diseño responsivo y optimizado para móviles.
* **Seguridad y Sesión:** Autenticación con cookies `HTTP-only` cifradas mediante JWT (`jose`) y contraseñas hasheadas con `bcryptjs`.
* **Visualización de Datos:** [Recharts](https://recharts.org/) y [Lucide Icons](https://lucide.dev/).
* **Soporte PWA:** Manifest y Service Worker integrados para instalación directa en dispositivos móviles.
* **Alojamiento:** Desplegado de forma continua en [Vercel](https://vercel.com/).

---

## 👤 Cuentas de Demostración Configuradas

Para explorar la aplicación en funcionamiento con datos simulados, se pueden utilizar las siguientes credenciales:

| Perfil | Correo Electrónico | Contraseña | Enfoque de la Cuenta |
| :--- | :--- | :--- | :--- |
| **Senior (Acudiente / Demo)** | `demo@behu.app` | `Demo1234` | Gestión familiar, métricas completas, presupuestos y metas. |
| **Junior (Estudiante)** | `estudiante@prueba.com` | `Prueba123` | Control de límites de mesada, metas de ahorro y educación. |

*(También es posible registrar una cuenta totalmente nueva desde el formulario de registro de la plataforma).*

---

## 📄 Contexto Académico

Proyecto desarrollado como parte de la asignatura **FIS 2025-3 (Fundamentos de Ingeniería de Software)**.  
Enfocado en la construcción de software con arquitectura limpia, alta cohesión, bajo acoplamiento y resolución de problemas reales de educación y disciplina financiera.
