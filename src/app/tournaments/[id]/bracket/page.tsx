"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getFlagSvgUrl } from "@/lib/utils";
import { getTournamentStatus, getTournamentBracket } from "@/lib/api";

interface BracketMatch {
  id: number;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  home_extra: number;
  away_extra: number;
  home_pen: number;
  away_pen: number;
  winnerId: number;
  status: string;
  bracket_position: number;
}

const phaseLabels: Record<string, string> = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter: "Quarter-finals",
  semi: "Semi-finals",
  final: "Final",
};

const phaseOrder = ["round_of_32", "round_of_16", "quarter", "semi", "final"];

function BracketNode({ match }: { match: BracketMatch }) {
  const isFinished = match.status === "finished";
  const hasExtra = match.home_extra > 0 || match.away_extra > 0;
  const hasPenalties = match.home_pen > 0 || match.away_pen > 0;
  const homeWon = isFinished && match.winnerId && match.homeScore > match.awayScore;
  const awayWon = isFinished && match.winnerId && match.awayScore > match.homeScore;

  return (
    <div className={`border w-56 bg-card transition-colors ${isFinished ? "border-foreground/15" : "border-border"}`}>
      <div className={`grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 ${homeWon ? "bg-field/5" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
            <img src={getFlagSvgUrl(match.homeCode || "")} alt={match.homeCode} className="h-full w-full object-cover" />
          </span>
          <span className={`truncate text-sm ${homeWon ? "font-semibold" : ""}`}>{match.homeTeam || "TBD"}</span>
        </div>
        <span className="font-mono text-sm tabular-nums">
          {match.homeScore}
          {hasExtra && <span className="ml-0.5 text-xs text-muted-foreground">({match.home_extra})</span>}
          {hasPenalties && <span className="ml-0.5 text-xs text-muted-foreground">[{match.home_pen}]</span>}
        </span>
      </div>
      <div className={`grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-3 py-2.5 ${awayWon ? "bg-field/5" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
            <img src={getFlagSvgUrl(match.awayCode || "")} alt={match.awayCode} className="h-full w-full object-cover" />
          </span>
          <span className={`truncate text-sm ${awayWon ? "font-semibold" : ""}`}>{match.awayTeam || "TBD"}</span>
        </div>
        <span className="font-mono text-sm tabular-nums">
          {match.awayScore}
          {hasExtra && <span className="ml-0.5 text-xs text-muted-foreground">({match.away_extra})</span>}
          {hasPenalties && <span className="ml-0.5 text-xs text-muted-foreground">[{match.away_pen}]</span>}
        </span>
      </div>
    </div>
  );
}

export default function BracketTreePage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<{ name: string; status: string } | null>(null);
  const [bracket, setBracket] = useState<Record<string, BracketMatch[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [status, bracketData] = await Promise.all([
          getTournamentStatus(String(tournamentId)),
          getTournamentBracket(String(tournamentId)),
        ]);
        setTournament(status);
        setBracket(bracketData || {});
      } catch (e) {
        console.error("Failed to fetch tournament bracket", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bracketPhases = phaseOrder.filter((p) => bracket[p] && bracket[p].length > 0);

  return (
    <div className="space-y-10">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/tournaments/${tournamentId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Knockout bracket</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {tournament?.name}
          </h1>
        </div>
      </header>

      <div className="overflow-x-auto border-t border-border pt-8">
        <div className="flex justify-start min-w-max pb-6">
          {bracketPhases.map((phase, phaseIndex) => {
            const matches = bracket[phase] || [];
            const isLastPhase = phaseIndex === bracketPhases.length - 1;
            return (
              <div key={phase} className="flex flex-col" style={{ width: isLastPhase ? 240 : 300 }}>
                <h3 className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {phaseLabels[phase]}
                </h3>
                <div className="flex flex-1 flex-col justify-around gap-6 relative">
                  {matches.map((match, matchIndex) => (
                    <div key={match.id} className="relative flex items-center justify-center w-full my-2">
                      <BracketNode match={match} />
                      {!isLastPhase && (
                        <>
                          <div className="absolute top-1/2 left-[224px] w-12 border-t border-border" />
                          {matchIndex % 2 === 0 && (
                            <>
                              <div className="absolute top-1/2 left-[272px] w-3 border-r border-t border-border h-[calc(50%+2rem)] origin-top" />
                              <div className="absolute top-[calc(100%+2rem)] left-[272px] w-12 border-t border-border" />
                            </>
                          )}
                          {matchIndex % 2 === 1 && (
                            <div className="absolute bottom-1/2 left-[272px] w-3 border-r border-b border-border h-[calc(50%+2rem)] origin-bottom" />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
