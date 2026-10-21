import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";

const points = [
  "Compara tu consumo semana a semana",
  "Metas de ahorro con seguimiento visual",
  "Análisis y recomendaciones inteligentes",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Link href="/" className="brand" style={{ padding: 0 }}>
          <span className="brand-mark">
            <Wallet size={16} />
          </span>
          BeHu
        </Link>
        <div>
          <h2>
            Cada peso cuenta. Toma el control de tus finanzas.
          </h2>
          <ul className="stack" style={{ listStyle: "none", marginTop: 24 }}>
            {points.map((p) => (
              <li key={p} className="row muted" style={{ fontSize: 13.5 }}>
                <CheckCircle2 size={16} color="var(--primary)" /> {p}
              </li>
            ))}
          </ul>
          <div className="card" style={{ marginTop: 28, maxWidth: 360, background: "var(--surface)" }}>
            <div className="row-between">
              <span className="muted" style={{ fontSize: 12.5 }}>
                Esta semana
              </span>
              <span className="delta good">−18,4 %</span>
            </div>
            <div className="stat-value" style={{ margin: "6px 0 10px" }}>
              $ 142,50
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: "62%" }} />
            </div>
            <p className="dim" style={{ fontSize: 11.5, marginTop: 8 }}>
              62 % completado de tu meta de ahorro 🎯
            </p>
          </div>
        </div>
        <p className="dim" style={{ fontSize: 12 }}>
          © {new Date().getFullYear()} BeHu
        </p>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
