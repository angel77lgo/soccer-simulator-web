"use client";

import { useEffect, useMemo, useState } from "react";
import { getClubs, getClubConfederations } from "@/lib/api";
import type { Club } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CONFEDERATION_ORDER = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];

const CONFEDERATION_LABELS: Record<string, string> = {
  UEFA: "UEFA",
  CONMEBOL: "CONMEBOL",
  CONCACAF: "CONCACAF",
  CAF: "CAF",
  AFC: "AFC",
  OFC: "OFC",
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [confederations, setConfederations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");
  const [activeConfed, setActiveConfed] = useState<string>("all");

  useEffect(() => {
    Promise.all([getClubs(), getClubConfederations()]).then(([clubsData, confeds]) => {
      setClubs(clubsData);
      setConfederations(confeds);
      setLoading(false);
    });
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Club[]> = {};
    for (const c of clubs) {
      const confed = c.confederation ?? "UNKNOWN";
      if (!map[confed]) map[confed] = [];
      map[confed].push(c);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        if (sortBy === "rating") {
          return (b.simulationRating ?? 0) - (a.simulationRating ?? 0);
        }
        return a.name.localeCompare(b.name);
      });
    }
    return map;
  }, [clubs, sortBy]);

  const orderedConfederations = useMemo(() => {
    const available = Object.keys(grouped);
    const ordered = CONFEDERATION_ORDER.filter((c) => available.includes(c));
    const others = available.filter((c) => !CONFEDERATION_ORDER.includes(c)).sort();
    return [...ordered, ...others];
  }, [grouped]);

  const filterClub = (c: Club) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.country ?? "").toLowerCase().includes(q) ||
      (c.league ?? "").toLowerCase().includes(q) ||
      (c.code ?? "").toLowerCase().includes(q)
    );
  };

  const renderClubTable = (list: Club[]) => {
    const filtered = list.filter(filterClub);
    if (filtered.length === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Ningún club coincide con la búsqueda.
        </p>
      );
    }
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
            <th className="py-3 pr-3 text-left font-medium w-14"></th>
            <th className="py-3 px-3 text-left font-medium">Club</th>
            <th className="py-3 px-3 text-left font-medium">País</th>
            <th className="py-3 px-3 text-left font-medium">Liga</th>
            <th className="py-3 pl-3 text-right font-medium">Sim rating</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((club) => (
            <tr key={club.id} className="border-b border-border/50 transition-colors hover:bg-secondary/40">
              <td className="py-3 pr-3">
                <span className="flex h-8 w-8 shrink-0 overflow-hidden items-center justify-center bg-white p-1 rounded-sm ring-1 ring-border">
                  {club.flagUrl ? (
                    <img
                      src={club.flagUrl}
                      alt={club.code}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{club.code}</span>
                  )}
                </span>
              </td>
              <td className="py-3 px-3 font-medium">
                {club.name}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{club.code}</span>
              </td>
              <td className="py-3 px-3">{club.country}</td>
              <td className="py-3 px-3 text-muted-foreground text-xs">{club.league}</td>
              <td className="py-3 pl-3 text-right font-mono tabular-nums text-muted-foreground">
                {club.simulationRating ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const totalForActive =
    activeConfed === "all"
      ? clubs.length
      : (grouped[activeConfed]?.length ?? 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Equipos
          </p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold leading-[0.9] tracking-tight md:text-5xl">
            Clubes
          </h1>
          <p className="mt-2.5 text-sm text-muted-foreground">
            {totalForActive} club{totalForActive === 1 ? "" : "es"}
            {activeConfed !== "all" && ` en ${CONFEDERATION_LABELS[activeConfed] || activeConfed}`}
            {" · "}
            {confederations.length} confederaciones
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clubes, ligas, países…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-0 border-b border-border bg-transparent pl-7 pr-0 text-sm rounded-none focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "rating" | "name")}>
            <SelectTrigger className="w-full sm:w-36 h-10 border-0 border-b border-border rounded-none focus-visible:ring-0 bg-transparent px-2">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Sim rating</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="border-t border-border pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs
            value={activeConfed}
            onValueChange={(v) => setActiveConfed((v ?? "all") as string)}
          >
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="all">
                Todos ({clubs.length})
              </TabsTrigger>
              {orderedConfederations.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {CONFEDERATION_LABELS[c] ?? c} ({grouped[c]?.length ?? 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-12">
                {orderedConfederations.map((c) => (
                  <section key={c}>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {CONFEDERATION_LABELS[c] ?? c}{" "}
                      <span className="text-muted-foreground/60">
                        · {grouped[c]?.length ?? 0}
                      </span>
                    </h2>
                    {renderClubTable(grouped[c] ?? [])}
                  </section>
                ))}
              </div>
            </TabsContent>

            {orderedConfederations.map((c) => (
              <TabsContent key={c} value={c}>
                {renderClubTable(grouped[c] ?? [])}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
