"use client";

import { useState, useEffect } from "react";
import { getTeams, simulateMatch } from "@/lib/api";
import { getFlagSvgUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Activity, Loader2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  fifaCode: string;
  flagUrl: string;
  fifaRanking?: number;
  simulationRating?: number;
}

interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  winnerId: string | null;
  score?: string;
  isDraw?: boolean;
  homePenalties?: number;
  awayPenalties?: number;
}

export default function SimulationPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeId, setHomeId] = useState<string>("");
  const [awayId, setAwayId] = useState<string>("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTeams().then((data) => setTeams(data));
  }, []);

  const handleSimulate = async () => {
    if (!homeId || !awayId || homeId === awayId) return;
    setLoading(true);
    try {
      const res = await simulateMatch(homeId, awayId);
      setResult(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const homeTeam = teams.find(t => String(t.id) === homeId);
  const awayTeam = teams.find(t => String(t.id) === awayId);
  const canSimulate = homeId && awayId && homeId !== awayId && !loading;

  return (
    <div className="space-y-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Simulación rápida
        </p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold leading-[0.9] tracking-tight md:text-5xl">
          Simular un partido
        </h1>
        <p className="mt-2.5 max-w-xl text-sm text-muted-foreground">
          Elige dos selecciones y deja que el simulador juegue el partido.
        </p>
      </header>

      <div className="border-t border-border pt-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <TeamSelect
            label="Local"
            teams={teams}
            value={homeId}
            onChange={(v) => { setHomeId(v); setResult(null); }}
            selectedTeam={homeTeam}
          />
          <TeamSelect
            label="Visitante"
            teams={teams}
            value={awayId}
            onChange={(v) => { setAwayId(v); setResult(null); }}
            selectedTeam={awayTeam}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleSimulate}
            disabled={!canSimulate}
            className="h-12 px-8 text-sm"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            {loading ? "Simulando…" : "Simular partido"}
          </Button>
          {!canSimulate && !loading && (
            <p className="text-xs text-muted-foreground">Selecciona dos equipos para simular.</p>
          )}
        </div>
      </div>

      {result && homeTeam && awayTeam && (
        <section className="border-t border-border pt-12">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Tiempo regular
          </p>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-12">
            <Side
              team={homeTeam}
              isWinner={result.homeGoals > result.awayGoals}
              align="right"
            />
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full bg-field/5 blur-3xl" />
                <div className="relative font-display text-7xl font-semibold leading-[0.8] tracking-tight md:text-8xl">
                  {result.homeGoals}
                  <span className="mx-3 text-muted-foreground/30">–</span>
                  {result.awayGoals}
                </div>
              </div>
              {result.homeGoals === result.awayGoals && result.homePenalties !== undefined && result.awayPenalties !== undefined && (
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Penales {result.homePenalties} – {result.awayPenalties}
                </p>
              )}
            </div>
            <Side
              team={awayTeam}
              isWinner={result.awayGoals > result.homeGoals}
              align="left"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function TeamSelect({
  label,
  teams,
  value,
  onChange,
  selectedTeam,
}: {
  label: string;
  teams: Team[];
  value: string;
  onChange: (v: string) => void;
  selectedTeam?: Team;
  excludeId?: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none border-0 border-b border-border bg-transparent px-0 text-base font-medium outline-none transition-colors focus:border-foreground"
      >
        <option value="">Seleccionar equipo</option>
        {teams.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.fifaCode})
          </option>
        ))}
      </select>

      {selectedTeam && (
        <div className="flex items-center gap-3 pt-2">
          <span className="flex h-8 w-12 shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
            <img
              src={getFlagSvgUrl(selectedTeam.fifaCode || "")}
              alt={selectedTeam.fifaCode}
              className="h-full w-full object-cover"
            />
          </span>
          <div>
            <p className="text-sm font-semibold">{selectedTeam.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {selectedTeam.fifaCode} · FIFA #{selectedTeam.fifaRanking ?? "—"} · Rating {selectedTeam.simulationRating ?? "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Side({
  team,
  isWinner,
  align,
}: {
  team: Team;
  isWinner: boolean;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${align === "right" ? "md:items-end" : "md:items-start"}`}>
      <span className="flex h-16 w-24 overflow-hidden rounded-sm ring-1 ring-border md:h-20 md:w-32">
        <img
          src={getFlagSvgUrl(team.fifaCode || "")}
          alt={team.fifaCode}
          className="h-full w-full object-cover"
        />
      </span>
      <div className={align === "right" ? "md:text-right" : "md:text-left"}>
        <p className={`text-lg font-semibold tracking-tight ${isWinner ? "" : "text-muted-foreground"}`}>
          {team.name}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {team.fifaCode}
        </p>
      </div>
    </div>
  );
}
