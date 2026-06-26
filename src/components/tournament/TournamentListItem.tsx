import Link from "next/link";
import { Loader2, Trash2, ArrowUpRight } from "lucide-react";
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
      className="group grid grid-cols-12 items-center gap-4 px-2 py-5 transition-colors hover:bg-secondary/40 sm:px-4"
    >
      <div className="col-span-12 sm:col-span-5 font-medium text-foreground">
        {tournament.name}
      </div>
      <div className="col-span-6 sm:col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-field" />
        {meta.label}
      </div>
      <div className="col-span-6 sm:col-span-2 text-sm text-muted-foreground capitalize">
        {tournament.type}
      </div>
      <div className="hidden sm:flex col-span-1 items-center justify-end">
        {hasChampion ? (
          <div title={tournament.champion_name}>
            <TeamFlag code={tournament.championCode || ""} size="sm" />
          </div>
        ) : (
          <span className="text-muted-foreground/30">—</span>
        )}
      </div>
      <div className="col-span-12 sm:col-span-1 flex items-center justify-end gap-1">
        <button
          onClick={(e) => onDelete(e, tournament.id)}
          disabled={deletingId === tournament.id}
          className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete tournament"
        >
          {deletingId === tournament.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
