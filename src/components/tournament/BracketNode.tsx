import { useState, useEffect } from "react";
import { BracketMatch, MatchSaveData } from "@/types";
import { ScoreStepper } from "./ScoreStepper";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface BracketNodeProps {
  match: BracketMatch;
  onSave: (matchId: string, data: MatchSaveData) => Promise<void>;
}

export function BracketNode({ match, onSave }: BracketNodeProps) {
  const [loading, setLoading] = useState(false);
  const [h, setH] = useState(match.homeScore ?? 0);
  const [a, setA] = useState(match.awayScore ?? 0);

  useEffect(() => {
    setH(match.homeScore ?? 0);
    setA(match.awayScore ?? 0);
  }, [match.homeScore, match.awayScore]);

  const commit = async (homeScore: number, awayScore: number) => {
    setLoading(true);
    try {
      await onSave(match.id, {
        homeScore,
        awayScore,
        homeExtraScore: match.home_extra ?? 0,
        awayExtraScore: match.away_extra ?? 0,
        homePenaltyScore: match.home_pen ?? 0,
        awayPenaltyScore: match.away_pen ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFinished = match.status === "finished";
  const homeWon = isFinished && match.winnerId && h > a;
  const awayWon = isFinished && match.winnerId && a > h;

  return (
    <div className={`border bg-card transition-colors w-56 ${isFinished ? "border-foreground/15" : "border-border"}`}>
      <div className={`grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 ${homeWon ? "bg-field/5" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={match.homeCode} flagUrl={match.homeFlagUrl} size="sm" />
          <span className={`truncate text-sm ${homeWon ? "font-semibold" : ""}`}>{match.homeTeam || "TBD"}</span>
        </div>
        <ScoreStepper value={h} onChange={(v) => { setH(v); commit(v, a); }} disabled={loading} />
      </div>
      <div className={`grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-3 py-2.5 ${awayWon ? "bg-field/5" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={match.awayCode} flagUrl={match.awayFlagUrl} size="sm" />
          <span className={`truncate text-sm ${awayWon ? "font-semibold" : ""}`}>{match.awayTeam || "TBD"}</span>
        </div>
        <ScoreStepper value={a} onChange={(v) => { setA(v); commit(h, v); }} disabled={loading} />
      </div>
    </div>
  );
}
