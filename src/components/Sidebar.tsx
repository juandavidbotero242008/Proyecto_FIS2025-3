"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Lightbulb, LayoutDashboard, LogOut, PiggyBank, Settings, Wallet, WalletCards } from "lucide-react";
import { logout } from "@/actions/auth";

const links = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/insights", label: "Análisis", icon: Lightbulb },
  { href: "/goals", label: "Metas", icon: PiggyBank },
  { href: "/budgets", label: "Presupuestos", icon: WalletCards },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export default function Sidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand">
        <span className="brand-mark">
          <Wallet size={18} />
        </span>
        BeHu
      </Link>

      <nav className="nav" aria-label="Navegación principal">
        <span className="nav-label">Menú</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            id={`nav-${l.href.slice(1)}`}
            className={`nav-link ${pathname.startsWith(l.href) ? "active" : ""}`}
          >
            <l.icon size={19} />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="avatar">{initials}</span>
          <div style={{ minWidth: 0 }}>
            <div className="name">{user.name}</div>
            <div className="email">{user.email}</div>
          </div>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost btn-block btn-sm" id="logout-btn">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
