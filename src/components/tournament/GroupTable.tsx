import { StandingRow } from "@/types";
import { TeamFlag } from "@/components/shared/TeamFlag";
import { Crown } from "lucide-react";

interface GroupTableProps {
  standings: StandingRow[];
  showGoalsDetails?: boolean;
  championCode?: string | null;
}

export function GroupTable({ standings, showGoalsDetails = false, championCode }: GroupTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <th className="py-2 pl-1 pr-2 text-left font-medium">#</th>
          <th className="py-2 px-2 text-left font-medium">Team</th>
          <th className="py-2 px-2 text-right font-medium">P</th>
          <th className="py-2 px-2 text-right font-medium">W</th>
          <th className="py-2 px-2 text-right font-medium">D</th>
          <th className="py-2 px-2 text-right font-medium">L</th>
          {showGoalsDetails && (
            <>
              <th className="py-2 px-2 text-right font-medium">GF</th>
              <th className="py-2 px-2 text-right font-medium">GA</th>
            </>
          )}
          <th className="py-2 px-2 text-right font-medium">GD</th>
          <th className="py-2 pl-2 pr-1 text-right font-medium">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((team, idx) => {
          const isChampion = championCode === team.teamCode;
          return (
            <tr key={team.teamId} className="border-t border-border">
              <td className="py-3 pl-1 pr-2 font-mono text-xs text-muted-foreground">
                {isChampion ? (
                  <Crown className="h-3.5 w-3.5 text-field inline" />
                ) : (
                  team.position ?? idx + 1
                )}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <TeamFlag code={team.teamCode} size="sm" />
                  <span className={`truncate ${isChampion ? "font-semibold" : "font-medium"}`}>{team.teamName}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{team.teamCode}</span>
                </div>
              </td>
              <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.played}</td>
              <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.wins}</td>
              <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.draws}</td>
              <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.losses}</td>
              {showGoalsDetails && (
                <>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.goalsFor}</td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-muted-foreground">{team.goalsAgainst}</td>
                </>
              )}
              <td className={`py-3 px-2 text-right font-mono tabular-nums ${team.goalDiff > 0 ? "text-field" : team.goalDiff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
              </td>
              <td className="py-3 pl-2 pr-1 text-right font-mono text-sm font-semibold tabular-nums">{team.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
