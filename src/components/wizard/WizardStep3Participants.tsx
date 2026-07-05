import { Input } from "@/components/ui/input";
import { Team } from "@/types";
import { getFlagSvgUrl, getTeamLogoUrl } from "@/lib/utils";

interface WizardStep3ParticipantsProps {
  effectiveQuotas: Record<string, number>;
  selectedTeamIds: string[];
  totalTeamsExpected: number;
  freedSlots: number;
  hostIds: string[];
  isStep3Valid: boolean;
  teamsByConfed: Record<string, Team[]>;
  participantSearchQueries: Record<string, string>;
  setParticipantSearchQueries: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  toggleParticipant: (teamId: string, confedCode: string) => void;
  randomizeConfederation: (confedCode: string) => void;
  getSelectedCountPerConfed: (confedCode: string) => number;
}

export function WizardStep3Participants({
  effectiveQuotas,
  selectedTeamIds,
  totalTeamsExpected,
  freedSlots,
  hostIds,
  isStep3Valid,
  teamsByConfed,
  participantSearchQueries,
  setParticipantSearchQueries,
  toggleParticipant,
  randomizeConfederation,
  getSelectedCountPerConfed,
}: WizardStep3ParticipantsProps) {
  return (
    <div className="space-y-6">
      {/* Effective quotas summary */}
      <div className="p-3 rounded-lg border border-border bg-secondary/40 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cupos Base (sin repechaje)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(effectiveQuotas).map(([code, quota]) => {
            const selected = getSelectedCountPerConfed(code);
            const isMet = selected === quota;
            return (
              <span key={code} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${isMet
                  ? "bg-field/10 text-field border-field/20"
                  : "bg-secondary text-foreground border-border"
                }`}>
                {code}: {selected}/{quota}
              </span>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-medium">Total clasificados: {selectedTeamIds.length} / {totalTeamsExpected - freedSlots - hostIds.length}</span>
          {isStep3Valid && (
            <span className="text-xs font-medium text-field bg-field/10 px-2.5 py-1 rounded-md border border-field/20">
              ¡Listo para continuar!
            </span>
          )}
        </div>
      </div>

      {/* Confederation panels */}
      <div className="space-y-6">
        {Object.entries(effectiveQuotas).map(([confedCode, quota]) => {
          if (quota <= 0) return null;
          const confedTeams = teamsByConfed[confedCode] || [];
          const selectedCount = getSelectedCountPerConfed(confedCode);
          const isMet = selectedCount === quota;

          return (
            <div key={confedCode} className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-semibold text-sm tracking-wide text-foreground">{confedCode}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => randomizeConfederation(confedCode)}
                    className="text-[10px] font-medium px-2 py-1 rounded-md border border-border bg-card text-foreground hover:bg-secondary transition flex items-center gap-1"
                    title={`Seleccionar aleatoriamente ${quota} equipo(s) de ${confedCode}`}
                  >
                    Aleatorio
                  </button>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${isMet
                      ? "bg-field/10 text-field border-field/20"
                      : "bg-secondary text-foreground border-border"
                    }`}>
                    {selectedCount} / {quota}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Buscar en {confedCode}</label>
                <Input
                  placeholder="Nombre o código FIFA..."
                  value={participantSearchQueries[confedCode] || ""}
                  onChange={e => setParticipantSearchQueries(prev => ({ ...prev, [confedCode]: e.target.value }))}
                  className="h-8 border-0 border-b border-border bg-transparent rounded-none px-0 text-xs focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              {confedTeams.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {participantSearchQueries[confedCode]
                    ? `No se encontraron selecciones en ${confedCode} que coincidan con "${participantSearchQueries[confedCode]}".`
                    : `No hay selecciones disponibles en ${confedCode}.`}
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {confedTeams.map(team => {
                    const isChecked = selectedTeamIds.includes(team.id);
                    const isDisabled = !isChecked && selectedCount >= quota;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => toggleParticipant(team.id, confedCode)}
                        disabled={isDisabled}
                        className={`flex items-center gap-3 p-2 rounded-md text-left text-xs transition border ${isChecked
                            ? "bg-secondary border-foreground/15"
                            : "hover:bg-secondary border-transparent"
                          } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex w-7 h-7 shrink-0 items-center justify-center bg-white p-0.5 rounded-sm ring-1 ring-border">
                           <img src={getTeamLogoUrl(team)} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate" title={team.name}>{team.name}</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground/80 truncate">
                            {team._country ? `${team._country} • ` : ""}{team.fifaCode} • #{team.fifaRanking}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
