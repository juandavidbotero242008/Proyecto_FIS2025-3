"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bot,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { logout } from "@/actions/auth";

type SidebarUser = {
  name: string;
  email: string;
  role?: "SENIOR" | "JUNIOR";
  score?: number;
};

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const isSenior = user.role !== "JUNIOR";

  const links = isSenior
    ? [
        { href: "/dashboard", label: "Resumen Global", icon: LayoutDashboard },
        { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
        { href: "/family", label: "Gestión Familiar", icon: Users },
        { href: "/budgets", label: "Presupuestos", icon: WalletCards },
        { href: "/goals", label: "Metas de Ahorro", icon: PiggyBank },
        { href: "/assistant", label: "BeHu Mini IA", icon: Bot },
        { href: "/settings", label: "Ajustes", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Mi Saldo y Límites", icon: LayoutDashboard },
        { href: "/transactions", label: "Mis Movimientos", icon: ArrowLeftRight },
        { href: "/goals", label: "Metas de Ahorro", icon: PiggyBank },
        { href: "/learn", label: "Aprende", icon: GraduationCap },
        { href: "/assistant", label: "BeHu Mini IA", icon: Bot },
        { href: "/settings", label: "Ajustes", icon: Settings },
      ];

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px 8px" }}>
          <span className="nav-label" style={{ padding: 0 }}>
            Menú {isSenior ? "Senior" : "Junior"}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 6,
              background: isSenior ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: isSenior ? "#60a5fa" : "#34d399",
              fontWeight: 600,
            }}
          >
            {isSenior ? "Acudiente" : "Junior"}
          </span>
        </div>

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
            <div className="email">
              Score: <span style={{ color: "var(--success)", fontWeight: 600 }}>{user.score ?? 75}/100</span>
            </div>
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
