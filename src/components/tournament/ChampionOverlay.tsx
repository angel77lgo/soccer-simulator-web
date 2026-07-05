import { TournamentData } from "@/types";
import { X, Crown } from "lucide-react";
import { TeamFlag } from "@/components/shared/TeamFlag";

interface ChampionOverlayProps {
  tournament: TournamentData;
  onClose: () => void;
}

export function ChampionOverlay({ tournament, onClose }: ChampionOverlayProps) {
  if (!tournament.champion_name) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6"
      onClick={onClose}
    >
      <button
        className="absolute right-6 top-6 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="max-w-2xl text-center" onClick={(e) => e.stopPropagation()}>
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
        <div className="mt-8 flex justify-center">
          <Crown className="h-6 w-6 text-field" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
