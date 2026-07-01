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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"ranking" | "name">("ranking");

  useEffect(() => {
    getTeams().then((data) => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  const filteredTeams = teams
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.fifaCode.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "ranking") {
        const rankA = a.fifaRanking ?? Infinity;
        const rankB = b.fifaRanking ?? Infinity;
        return rankA - rankB;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Teams
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            National teams
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {teams.length} FIFA-affiliated teams
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-0 border-b border-border bg-transparent pl-7 pr-0 text-sm rounded-none focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-36 h-10 border-0 border-b border-border rounded-none focus-visible:ring-0 bg-transparent px-2">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ranking">Ranking</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="border-t border-border">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th className="py-3 pr-3 text-left font-medium w-14"></th>
                <th className="py-3 px-3 text-left font-medium">Code</th>
                <th className="py-3 px-3 text-left font-medium">Name</th>
                <th className="py-3 px-3 text-left font-medium">Confederation</th>
                <th className="py-3 px-3 text-right font-medium">FIFA rank</th>
                <th className="py-3 pl-3 text-right font-medium">Sim rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id} className="border-t border-border transition-colors hover:bg-secondary/40">
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
                  <td className="py-3 px-3 text-muted-foreground">{team.confederation?.code || "—"}</td>
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
                    No teams match your search.
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
