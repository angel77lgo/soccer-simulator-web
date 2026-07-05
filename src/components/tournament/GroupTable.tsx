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
        <tr className="text-xs uppercase tracking-[0.1em] text-field-foreground">
          <th className="py-2.5 pl-3 pr-2 text-left font-medium rounded-tl-lg bg-field/90">#</th>
          <th className="py-2.5 px-2 text-left font-medium bg-field/90">Equipo</th>
          <th className="py-2.5 px-2 text-right font-medium bg-field/90">PJ</th>
          <th className="py-2.5 px-2 text-right font-medium bg-field/90">G</th>
          <th className="py-2.5 px-2 text-right font-medium bg-field/90">E</th>
          <th className="py-2.5 px-2 text-right font-medium bg-field/90">P</th>
          {showGoalsDetails && (
            <>
              <th className="py-2.5 px-2 text-right font-medium bg-field/90">GF</th>
              <th className="py-2.5 px-2 text-right font-medium bg-field/90">GC</th>
            </>
          )}
          <th className="py-2.5 px-2 text-right font-medium bg-field/90">DG</th>
          <th className="py-2.5 pl-2 pr-3 text-right font-medium rounded-tr-lg bg-field/90">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((team, idx) => {
          const isChampion = championCode === team.teamCode;
          return (
            <tr key={team.teamId} className={`border-t border-border ${idx % 2 === 0 ? "" : "bg-secondary/30"}`}>
              <td className="py-3 pl-3 pr-2 font-mono text-xs text-muted-foreground">
                {isChampion ? (
                  <Crown className="h-3.5 w-3.5 text-field inline" />
                ) : (
                  team.position ?? idx + 1
                )}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <TeamFlag code={team.teamCode} flagUrl={team.teamFlagUrl} size="sm" />
                  <span className={`truncate ${isChampion ? "font-semibold" : "font-medium"}`}>{team.teamName}</span>
                  <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">{team.teamCode}</span>
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
              <td className="py-3 pl-2 pr-3 text-right font-mono text-sm font-bold tabular-nums text-foreground">{team.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
