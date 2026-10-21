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

        {/* Vista previa minimalista y nativa del dashboard en código */}
        <div className="hero-visual animate-in">
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px 28px",
              boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.6)",
              textAlign: "left",
            }}
          >
            {/* Barra superior de la ventana */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 14,
                marginBottom: 18,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>
                app.behu.com/dashboard
              </div>
              <div style={{ width: 40 }} />
            </div>

            {/* Fila de métricas del mockup */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Saldo disponible</span>
                  <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>+14.2%</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>$ 1.840.000</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  $ 450.000 reservados en metas
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Consumo semanal</span>
                  <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>71%</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>$ 142.500</div>
                <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: "71%", height: "100%", background: "var(--primary)" }} />
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Score BeHu</span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "var(--success)",
                      fontWeight: 600,
                    }}
                  >
                    Excelente
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--success)" }}>88 / 100</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  Hábitos y límites bajo control
                </div>
              </div>
            </div>

            {/* Mini fila de movimientos recientes de ejemplo */}
            <div
              style={{
                background: "var(--surface)",
                padding: "14px 18px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Actividad reciente
                </span>
                <span style={{ fontSize: 11, color: "var(--primary)" }}>En tiempo real</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
                  <span style={{ fontWeight: 500 }}>Supermercado semanal</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Alimentación</span>
                </div>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>− $ 84.000</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                  <span style={{ fontWeight: 500 }}>Aporte a Meta: Primer Viaje ✈️</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Ahorro</span>
                </div>
                <span style={{ fontWeight: 600, color: "var(--success)" }}>+ $ 50.000</span>
              </div>
            </div>
          </div>
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
