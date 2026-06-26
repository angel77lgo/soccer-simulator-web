import { useState, useEffect } from "react";
import { GroupMatch } from "@/types";
import { ScoreStepper } from "./ScoreStepper";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface GroupMatchCardProps {
  match: GroupMatch;
  onSave: (matchId: string, data: { homeScore: number; awayScore: number }) => Promise<void>;
}

export function GroupMatchCard({ match, onSave }: GroupMatchCardProps) {
  const [loading, setLoading] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);

  useEffect(() => {
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
  }, [match.homeScore, match.awayScore]);

  const commit = async (h: number, a: number) => {
    setLoading(true);
    try {
      await onSave(match.id, { homeScore: h, awayScore: a });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0 justify-end text-right">
        <span className="truncate text-sm font-medium">{match.homeTeam}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{match.homeCode}</span>
        <TeamFlag code={match.homeCode} />
      </div>
      <div className="flex items-center gap-3">
        <ScoreStepper value={homeScore} onChange={(v) => { setHomeScore(v); commit(v, awayScore); }} disabled={loading} />
        <span className="text-muted-foreground/40 text-xs">vs</span>
        <ScoreStepper value={awayScore} onChange={(v) => { setAwayScore(v); commit(homeScore, v); }} disabled={loading} />
      </div>
      <div className="flex items-center gap-2.5 min-w-0">
        <TeamFlag code={match.awayCode} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{match.awayCode}</span>
        <span className="truncate text-sm font-medium">{match.awayTeam}</span>
      </div>
    </div>
  );
}
