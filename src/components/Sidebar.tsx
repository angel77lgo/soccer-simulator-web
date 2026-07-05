"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Flag, Building2, Activity, Circle, Sun, Moon } from "lucide-react";
import type { ComponentType } from "react";
import { useAppStore } from "@/store";

const links: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/tournaments", label: "Torneos", icon: Trophy },
  { href: "/teams/national", label: "Selecciones", icon: Flag },
  { href: "/teams/clubs", label: "Clubes", icon: Building2 },
  { href: "/simulation", label: "Simular", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppStore();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <Link
        href="/tournaments"
        className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5 bg-gradient-to-r from-field/[0.04] to-transparent"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-field text-field-foreground shadow-sm shadow-field/20">
          <Circle className="h-4 w-4 fill-current" />
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
            Simulador
          </span>
          <span className="text-[8px] text-muted-foreground font-semibold tracking-[0.2em] uppercase mt-0.5">
            de Fútbol
          </span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="px-3 pt-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Navegación
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                active
                  ? "font-medium text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-field" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Simulador de Fútbol · v1.0</p>
          <button
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
