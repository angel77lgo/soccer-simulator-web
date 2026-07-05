"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Flag, Building2, Activity, Sun, Moon, Circle } from "lucide-react";
import type { ComponentType } from "react";
import { useAppStore } from "@/store";

const links: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/tournaments", label: "Torneos", icon: Trophy },
  { href: "/teams/national", label: "Selecciones", icon: Flag },
  { href: "/teams/clubs", label: "Clubes", icon: Building2 },
  { href: "/simulation", label: "Simular", icon: Activity },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-4 md:px-6">
      <Link
        href="/tournaments"
        className="flex items-center gap-2 mr-6 md:mr-10"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-field">
          <Circle className="h-3 w-3 fill-current text-field-foreground" />
        </span>
        <span className="hidden text-sm font-bold tracking-tight md:inline-block">
          Simulador
        </span>
      </Link>

      <nav className="flex items-center gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors md:px-3 ${
                active
                  ? "bg-field/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
