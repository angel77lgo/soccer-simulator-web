import Link from "next/link";
import { Loader2, Trash2, ArrowUpRight, Crown } from "lucide-react";
import { TournamentListItem as TournamentListItemType } from "@/types";
import { statusMeta } from "@/lib/constants";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface TournamentListItemProps {
  tournament: TournamentListItemType;
  deletingId: string | null;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function TournamentListItem({ tournament, deletingId, onDelete }: TournamentListItemProps) {
  const meta = statusMeta[tournament.status] || { label: tournament.status };
  const hasChampion = tournament.status === "finished" && tournament.champion_name;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group relative flex flex-col bg-card rounded-xl ring-1 ring-border overflow-hidden transition-all hover:ring-foreground/20 hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="h-1 shrink-0 bg-field/60" />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-field" />
            <span>{meta.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {tournament.type === "national" ? "Selecciones" : "Clubes"}
            </span>
            <button
              onClick={(e) => onDelete(e, tournament.id)}
              disabled={deletingId === tournament.id}
              className="ml-1 rounded-md p-1 text-muted-foreground/30 transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Eliminar torneo"
            >
              {deletingId === tournament.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <h3 className="font-display text-2xl font-semibold leading-[0.9] tracking-tight text-foreground">
          {tournament.name}
        </h3>

        {hasChampion && tournament.championCode && (
          <div className="flex items-center gap-2 mt-1">
            <Crown className="h-3.5 w-3.5 text-field shrink-0" strokeWidth={2} />
            <TeamFlag code={tournament.championCode} flagUrl={undefined} size="sm" />
            <span className="text-xs text-muted-foreground truncate">{tournament.champion_name}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-xs text-muted-foreground/60 transition-colors group-hover:text-foreground">
          Abrir torneo
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
