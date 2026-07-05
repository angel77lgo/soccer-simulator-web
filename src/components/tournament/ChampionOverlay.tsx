import { TournamentData } from "@/types";
import { X, Trophy } from "lucide-react";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface ChampionOverlayProps {
  tournament: TournamentData;
  onClose: () => void;
}

export function ChampionOverlay({ tournament, onClose }: ChampionOverlayProps) {
  if (!tournament.champion_name) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <button
        className="absolute right-6 top-6 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <X className="mr-1.5 inline h-3.5 w-3.5" />
        Cerrar
      </button>

      <div className="max-w-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-field/10">
            <Trophy className="h-5 w-5 text-field" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Campeón
        </p>
        <div className="my-8 flex justify-center">
          <TeamFlag code={tournament.championCode || ""} flagUrl={tournament.championFlagUrl || ""} size="xl" />
        </div>
        <h1 className="font-display text-6xl font-semibold leading-[0.85] tracking-tight md:text-8xl">
          {tournament.champion_name}
        </h1>
        <p className="mt-3 font-mono text-sm tracking-wider text-muted-foreground">
          {tournament.championCode}
        </p>
        <p className="mt-10 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {tournament.name}
        </p>
      </div>
    </div>
  );
}
