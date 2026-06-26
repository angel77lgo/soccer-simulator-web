import { Input } from "@/components/ui/input";
import { Team } from "@/types";
import { getFlagSvgUrl } from "@/lib/utils";

interface WizardStep2HostsProps {
  hostIds: string[];
  hostTeams: Team[];
  toggleHost: (id: string) => void;
  hostCandidates: Team[];
  baseQuotas: Record<string, number>;
  hostsByConfed: Record<string, number>;
  effectiveQuotas: Record<string, number>;
  freedSlots: number;
  isWorldCup: boolean;
  hostSearchQuery: string;
  setHostSearchQuery: (query: string) => void;
}

export function WizardStep2Hosts({
  hostIds,
  hostTeams,
  toggleHost,
  hostCandidates,
  baseQuotas,
  hostsByConfed,
  effectiveQuotas,
  freedSlots,
  isWorldCup,
  hostSearchQuery,
  setHostSearchQuery,
}: WizardStep2HostsProps) {
  return (
    <div className="space-y-5">
      {/* Info block */}
      <div className="p-4 rounded-lg border border-border bg-secondary/40 text-sm space-y-1">
        <p className="font-semibold text-foreground">¿Cómo funciona?</p>
        <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
          <li>Los anfitriones clasifican automáticamente.</li>
          <li>{isWorldCup ? "Consumen una plaza directa de su confederación. Su confederación gana 1 boleto extra para el Torneo de Repechaje (pudiendo tener hasta 2 ganadores en el Paso 4)." : "En este torneo no hay plazas de repechaje (el anfitrión solo ocupa su propia plaza)."}</li>
        </ul>
      </div>

      {/* Current distribution preview */}
      {hostIds.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-secondary/40 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Resumen de plazas</span>
            <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded font-medium">
              {freedSlots} plaza{freedSlots !== 1 ? "s" : ""} de repechaje libre
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(baseQuotas).map(([code, base]) => {
              const hostDeduct = hostsByConfed[code] || 0;
              const effective = effectiveQuotas[code] ?? base;
              const changed = hostDeduct > 0;
              return (
                <div key={code} className={`text-xs px-3 py-2 rounded-lg border font-medium flex flex-col items-center gap-0.5 ${changed ? "bg-card border-foreground/15" : "bg-secondary/40 border-border"
                  }`}>
                  <span className="text-muted-foreground">{code}</span>
                  <span className="text-base font-semibold">{effective}</span>
                  {hostDeduct > 0 && (
                    <span className="text-[10px] text-destructive">−{hostDeduct} anfitrión</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Host search */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Buscar país anfitrión</label>
        <Input
          placeholder="Nombre o código FIFA..."
          value={hostSearchQuery}
          onChange={e => setHostSearchQuery(e.target.value)}
          className="h-10 border-0 border-b border-border bg-transparent rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      {/* Selected hosts chips */}
      {hostIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hostTeams.map(team => (
            <div key={team.id} className="flex items-center gap-1.5 bg-secondary border border-border rounded-full px-2.5 py-1 text-xs font-medium text-foreground">
              <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-5 h-3.5 object-cover rounded" />
              {team.name} ({team.fifaCode})
              <button type="button" onClick={() => toggleHost(team.id)} className="ml-1 text-muted-foreground hover:text-destructive">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Host list grouped by confederation */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {hostCandidates.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-6 bg-secondary/40 rounded-md border border-dashed border-border">
            No se encontraron países que coincidan con &quot;{hostSearchQuery}&quot;.
          </p>
        ) : (
          Object.entries(baseQuotas).map(([confedCode, quota]) => {
            if (quota <= 0) return null;
            const confedTeams = hostCandidates.filter(t => t.confederation?.code === confedCode);
            if (confedTeams.length === 0) return null;

            return (
              <div key={confedCode}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{confedCode}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {confedTeams.map(team => {
                    const isHost = hostIds.includes(team.id);
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => toggleHost(team.id)}
                        className={`flex items-center gap-3 p-2 rounded-md text-left text-xs transition border ${isHost
                            ? "bg-secondary border-foreground/15"
                            : "hover:bg-secondary border-transparent"
                          } cursor-pointer`}
                      >
                        <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-7 h-5 object-cover rounded-sm ring-1 ring-border" />
                        <div className="flex flex-col">
                          <span className="font-medium">{team.name} ({team.fifaCode})</span>
                          <p className="text-xs text-muted-foreground mt-1">Ranking FIFA: {team.fifaRanking}</p>
                        </div>
                        {isHost && <span className="ml-auto text-field text-[10px] font-semibold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
