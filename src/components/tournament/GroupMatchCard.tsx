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
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border py-2.5 last:border-0">
      <div className="flex items-center gap-2 min-w-0 justify-end text-right">
        <span className="truncate text-sm font-medium">{match.homeTeam}</span>
        <span className="font-mono text-[10px] uppercase text-muted-foreground hidden sm:inline">{match.homeCode}</span>
        <TeamFlag code={match.homeCode} flagUrl={match.homeFlagUrl} />
      </div>
      <div className="flex items-center gap-2">
        <ScoreStepper value={homeScore} onChange={(v) => { setHomeScore(v); commit(v, awayScore); }} disabled={loading} />
        <span className="text-muted-foreground/30 text-[10px] font-medium">vs</span>
        <ScoreStepper value={awayScore} onChange={(v) => { setAwayScore(v); commit(homeScore, v); }} disabled={loading} />
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <TeamFlag code={match.awayCode} flagUrl={match.awayFlagUrl} />
        <span className="font-mono text-[10px] uppercase text-muted-foreground hidden sm:inline">{match.awayCode}</span>
        <span className="truncate text-sm font-medium">{match.awayTeam}</span>
      </div>
    </div>
  );
}
