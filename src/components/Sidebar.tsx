"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, Activity, Circle } from "lucide-react";
import type { ComponentType } from "react";

const links: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/simulation", label: "Simulate", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <Link
        href="/tournaments"
        className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-field text-field-foreground">
          <Circle className="h-3 w-3 fill-current" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          Pitchside
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="px-3 pt-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-foreground"
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

      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="text-[11px] text-muted-foreground">Pitchside · v1.0</p>
      </div>
    </aside>
  );
}
