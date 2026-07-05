"use client";

import { useEffect, useState } from "react";
import { getTeams } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { getFlagSvgUrl } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Team {
  id: string;
  name: string;
  shortName: string;
  fifaCode: string;
  flagUrl: string;
  confederation?: {
    id: string;
    name: string;
    code: string;
  };
  fifaRanking?: number;
  simulationRating?: number;
}

const CONFEDERATION_LABELS: Record<string, string> = {
  UEFA: "UEFA (Europa)",
  CONMEBOL: "CONMEBOL (Sudamérica)",
  CONCACAF: "CONCACAF (Norte/Centroamérica)",
  CAF: "CAF (África)",
  AFC: "AFC (Asia)",
  OFC: "OFC (Oceanía)",
};

export default function NationalTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"ranking" | "name">("ranking");
  const [confedFilter, setConfedFilter] = useState<string>("all");

  useEffect(() => {
    getTeams().then((data) => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  const confederations = Array.from(
    new Set(teams.map((t) => t.confederation?.code).filter(Boolean) as string[]),
  ).sort();

  const filteredTeams = teams
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.fifaCode ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesConfed =
        confedFilter === "all" || t.confederation?.code === confedFilter;
      return matchesSearch && matchesConfed;
    })
    .sort((a, b) => {
      if (sortBy === "ranking") {
        const rankA = a.fifaRanking ?? Infinity;
        const rankB = b.fifaRanking ?? Infinity;
        return rankA - rankB;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Equipos
          </p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold leading-[0.9] tracking-tight md:text-5xl">
            Selecciones Nacionales
          </h1>
          <p className="mt-2.5 text-sm text-muted-foreground">
            {filteredTeams.length} de {teams.length} selecciones afiliadas a FIFA
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-0 border-b border-border bg-transparent pl-7 pr-0 text-sm rounded-none focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <Select
            value={confedFilter}
            onValueChange={(v) => setConfedFilter((v ?? "all") as string)}
          >
            <SelectTrigger className="w-full sm:w-44 h-10 border-0 border-b border-border rounded-none focus-visible:ring-0 bg-transparent px-2">
              <SelectValue placeholder="Confederación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las confederaciones</SelectItem>
              {confederations.map((c) => (
                <SelectItem key={c} value={c}>
                  {CONFEDERATION_LABELS[c] ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "ranking" | "name")}>
            <SelectTrigger className="w-full sm:w-36 h-10 border-0 border-b border-border rounded-none focus-visible:ring-0 bg-transparent px-2">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ranking">Ranking</SelectItem>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
                <th className="py-3 pr-3 text-left font-medium w-14"></th>
                <th className="py-3 px-3 text-left font-medium">Código</th>
                <th className="py-3 px-3 text-left font-medium">Nombre</th>
                <th className="py-3 px-3 text-left font-medium">Confederación</th>
                <th className="py-3 px-3 text-right font-medium">Ranking FIFA</th>
                <th className="py-3 pl-3 text-right font-medium">Sim rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id} className="border-b border-border/50 transition-colors hover:bg-secondary/40">
                  <td className="py-3 pr-3">
                    <span className="flex h-5 w-7 shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
                      <img
                        src={getFlagSvgUrl(team.fifaCode || "")}
                        alt={team.fifaCode}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">{team.fifaCode}</td>
                  <td className="py-3 px-3 font-medium">{team.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {team.confederation?.code || "—"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-muted-foreground">
                    {team.fifaRanking ? `#${team.fifaRanking}` : "—"}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums text-muted-foreground">
                    {team.simulationRating ?? "—"}
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                    Ningún equipo coincide con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
