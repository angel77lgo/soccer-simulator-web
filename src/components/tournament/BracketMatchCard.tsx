import { useState, useEffect } from "react";
import { BracketMatch, MatchSaveData } from "@/types";
import { ScoreStepper } from "./ScoreStepper";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface BracketMatchCardProps {
  match: BracketMatch;
  onSave: (matchId: string, data: MatchSaveData) => Promise<void>;
}

export function BracketMatchCard({ match, onSave }: BracketMatchCardProps) {
  const [loading, setLoading] = useState(false);
  const [h, setH] = useState(match.homeScore ?? 0);
  const [a, setA] = useState(match.awayScore ?? 0);
  const [he, setHe] = useState(match.home_extra ?? 0);
  const [ae, setAe] = useState(match.away_extra ?? 0);
  const [hp, setHp] = useState(match.home_pen ?? 0);
  const [ap, setAp] = useState(match.away_pen ?? 0);

  useEffect(() => {
    setH(match.homeScore ?? 0);
    setA(match.awayScore ?? 0);
    setHe(match.home_extra ?? 0);
    setAe(match.away_extra ?? 0);
    setHp(match.home_pen ?? 0);
    setAp(match.away_pen ?? 0);
  }, [match.homeScore, match.awayScore, match.home_extra, match.away_extra, match.home_pen, match.away_pen]);

  const commit = async (patch: Partial<MatchSaveData>) => {
    setLoading(true);
    try {
      await onSave(match.id, {
        homeScore: h,
        awayScore: a,
        homeExtraScore: he,
        awayExtraScore: ae,
        homePenaltyScore: hp,
        awayPenaltyScore: ap,
        ...patch,
      });
    } finally {
      setLoading(false);
    }
  };

  const isTied = h === a;
  const isExtraTied = isTied && h + he === a + ae;

  return (
    <div className="border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={match.homeCode} size="sm" />
          <span className="truncate text-sm">{match.homeTeam || "TBD"}</span>
        </div>
        <ScoreStepper value={h} onChange={(v) => { setH(v); commit({ homeScore: v }); }} disabled={loading} />
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={match.awayCode} size="sm" />
          <span className="truncate text-sm">{match.awayTeam || "TBD"}</span>
        </div>
        <ScoreStepper value={a} onChange={(v) => { setA(v); commit({ awayScore: v }); }} disabled={loading} />
      </div>

      {isTied && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Extra time</p>
          <div className="grid grid-cols-2 gap-3">
            <ScoreStepper value={he} onChange={(v) => { setHe(v); commit({ homeExtraScore: v }); }} disabled={loading} />
            <ScoreStepper value={ae} onChange={(v) => { setAe(v); commit({ awayExtraScore: v }); }} disabled={loading} />
          </div>
        </div>
      )}

      {isTied && isExtraTied && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Penalties</p>
          <div className="grid grid-cols-2 gap-3">
            <ScoreStepper value={hp} onChange={(v) => { setHp(v); commit({ homePenaltyScore: v }); }} disabled={loading} />
            <ScoreStepper value={ap} onChange={(v) => { setAp(v); commit({ awayPenaltyScore: v }); }} disabled={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
