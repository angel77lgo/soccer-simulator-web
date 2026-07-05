import Link from "next/link";
import { Loader2, Trash2, ArrowUpRight, Crown, Circle } from "lucide-react";
import { TournamentListItem as TournamentListItemType } from "@/types";
import { statusMeta } from "@/lib/constants";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface TournamentListItemProps {
  tournament: TournamentListItemType;
  deletingId: string | null;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ACTIVE_STATUSES = ["group_stage", "league_phase", "round_of_32", "round_of_16", "quarter", "semi", "final"];

export function TournamentListItem({ tournament, deletingId, onDelete }: TournamentListItemProps) {
  const meta = statusMeta[tournament.status] || { label: tournament.status };
  const hasChampion = tournament.status === "finished" && tournament.champion_name;
  const isActive = ACTIVE_STATUSES.includes(tournament.status);

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group relative flex flex-col bg-card rounded-xl border-l-[3px] border-l-field overflow-hidden transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isActive ? (
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-field/40 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-field" />
              </span>
            ) : (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            )}
            <span>{meta.label}</span>
          </div>
          <button
            onClick={(e) => onDelete(e, tournament.id)}
            disabled={deletingId === tournament.id}
            className="rounded-md p-1 text-muted-foreground/20 transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Eliminar torneo"
          >
            {deletingId === tournament.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <h3 className="font-display text-2xl font-semibold leading-[0.9] tracking-tight text-foreground">
          {tournament.name}
        </h3>

        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          <Circle className="h-2.5 w-2.5 fill-current opacity-40" strokeWidth={2} />
          {tournament.type === "national" ? "Selecciones" : "Clubes"}
        </div>

        {hasChampion && tournament.championCode && (
          <div className="flex items-center gap-2 rounded-lg bg-field/5 px-3 py-2">
            <Crown className="h-3.5 w-3.5 shrink-0 text-field" strokeWidth={2} />
            <TeamFlag code={tournament.championCode} flagUrl={undefined} size="sm" />
            <span className="text-xs font-medium text-foreground truncate">{tournament.champion_name}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-foreground">
          Abrir torneo
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 transition-all group-hover:text-field group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
