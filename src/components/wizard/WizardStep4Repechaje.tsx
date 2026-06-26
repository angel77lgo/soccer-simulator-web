import { Input } from "@/components/ui/input";
import { Team } from "@/types";
import { getFlagSvgUrl } from "@/lib/utils";

interface WizardStep4RepechajeProps {
  repechajeTeamIds: string[];
  freedSlots: number;
  toggleRepechaje: (id: string) => void;
  repechajeCandidates: Team[];
  repechajeSearchQuery: string;
  setRepechajeSearchQuery: (query: string) => void;
}

export function WizardStep4Repechaje({
  repechajeTeamIds,
  freedSlots,
  toggleRepechaje,
  repechajeCandidates,
  repechajeSearchQuery,
  setRepechajeSearchQuery,
}: WizardStep4RepechajeProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-border bg-secondary/40 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground text-sm">Repechaje Intercontinental</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${repechajeTeamIds.length === freedSlots
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-foreground border-border"
            }`}>
            {repechajeTeamIds.length} / {freedSlots} plazas llenas
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Selecciona a los ganadores del torneo de repechaje intercontinental (excluyendo equipos europeos UEFA y equipos ya clasificados).</p>
          <ul className="list-disc list-inside">
            <li>Participan 6 equipos: 1 por confederación (excepto UEFA) + 1 extra de la confederación anfitriona.</li>
            <li>Por tanto, solo la confederación anfitriona puede tener 2 ganadores en esta fase.</li>
          </ul>
        </div>
      </div>

      {freedSlots === 0 ? (
        <div className="text-center py-8 border border-border rounded-lg bg-secondary/40">
          <p className="text-sm font-medium text-muted-foreground">
            No hay plazas de repechaje disponibles porque no hay anfitriones seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Buscar selección para repechaje</label>
            <Input
              placeholder="Nombre o código FIFA..."
              value={repechajeSearchQuery}
              onChange={e => setRepechajeSearchQuery(e.target.value)}
              className="h-10 border-0 border-b border-border bg-transparent rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {repechajeCandidates.map(team => {
              const isChecked = repechajeTeamIds.includes(team.id);
              const isDisabled = !isChecked && repechajeTeamIds.length >= freedSlots;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => toggleRepechaje(team.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-3 p-2 rounded-md text-left text-xs transition border ${isChecked
                      ? "bg-secondary border-foreground/15"
                      : "hover:bg-secondary border-transparent bg-card"
                    } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-7 h-5 object-cover rounded-sm ring-1 ring-border" />
                  <div className="flex flex-col">
                    <span className="font-medium">{team.name} ({team.fifaCode})</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{team.confederation?.code}</span>
                  </div>
                </button>
              );
            })}
            {repechajeCandidates.length === 0 && (
              <p className="col-span-full text-center text-xs text-muted-foreground py-4">
                No hay más equipos elegibles para el repechaje.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
