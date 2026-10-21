import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Lightbulb, PiggyBank, Receipt, Sparkles, Wallet } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Registro en segundos",
    text: "Anota gastos e ingresos con categoría, método de pago, etiquetas y notas rápidas.",
  },
  {
    icon: BarChart3,
    title: "Semana vs. semana",
    text: "Compara cuánto gastas respecto a la semana anterior, en total y por categoría.",
  },
  {
    icon: PiggyBank,
    title: "Metas de ahorro",
    text: "Define objetivos concretos, registra aportes y calcula cuánto ahorrar cada semana.",
  },
  {
    icon: Wallet,
    title: "Presupuestos mensuales",
    text: "Establece límites por categoría y recibe alertas oportunas antes de excederte.",
  },
  {
    icon: Lightbulb,
    title: "Consejos personalizados",
    text: "Un motor de análisis evalúa tus patrones reales y sugiere decisiones prácticas.",
  },
  {
    icon: Sparkles,
    title: "Regla 50/30/20",
    text: "Evalúa cómo se distribuye tu dinero entre necesidades, estilo de vida y ahorro.",
  },
];

export default function Home() {
  return (
    <>
      <header className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Wallet size={16} />
          </span>
          BeHu
        </Link>
        <nav className="row">
          <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm" id="nav-register">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero animate-in">
          <span className="pill">Finanzas personales claras y sin fricción</span>
          <h1>
            Entiende tu dinero.
            <br />
            Ahorra con intención.
          </h1>
          <p>
            BeHu te ayuda a registrar tus gastos, compararte semana a semana, alcanzar tus metas de ahorro y
            recibir sugerencias basadas en tus hábitos reales.
          </p>
          <div className="hero-cta">
            <Link href="/register" className="btn btn-primary" id="hero-cta-register">
              Empezar ahora <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn" id="hero-cta-demo">
              Probar cuenta demo
            </Link>
          </div>
        </section>

        <div className="hero-visual animate-in">
          <Image
            src="/hero-dashboard.jpg"
            alt="Panel de BeHu con balance, métricas y gráficos de control financiero"
            width={1376}
            height={768}
            priority
          />
        </div>

        <section className="features">
          <h2 style={{ textAlign: "center", fontSize: 26, marginBottom: 32 }}>
            Herramientas pensadas para tu control financiero
          </h2>
          <div className="grid grid-3">
            {features.map((f) => (
              <article key={f.title} className="card card-lift feature">
                <div className="stat-icon" style={{ marginBottom: 14 }}>
                  <f.icon size={18} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">BeHu · Aplicación de finanzas personales · {new Date().getFullYear()}</footer>
    </>
  );
}
