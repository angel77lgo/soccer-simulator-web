import { Team, Template } from "@/types";
import { getFlagSvgUrl } from "@/lib/utils";

interface WizardStep6ConfirmProps {
  name: string;
  type: "official" | "custom";
  subType: string;
  templates: Record<string, Template>;
  totalTeamsExpected: number;
  hostIds: string[];
  hostTeams: Team[];
  selectedTeamIds: string[];
  repechajeTeamIds: string[];
  availableTeams: Team[];
}

export function WizardStep6Confirm({
  name,
  type,
  subType,
  templates,
  totalTeamsExpected,
  hostIds,
  hostTeams,
  selectedTeamIds,
  repechajeTeamIds,
  availableTeams,
}: WizardStep6ConfirmProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border rounded-lg bg-secondary/40">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.12em]">Nombre</p>
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.12em]">Formato</p>
          <p className="text-lg font-semibold">
            {type === "official" ? templates[subType]?.name || subType : "Personalizado"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.12em]">Total Equipos</p>
          <p className="text-lg font-semibold">{totalTeamsExpected} selecciones</p>
        </div>
      </div>

      {/* Hosts */}
      {hostIds.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            Países Anfitriones ({hostIds.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {hostTeams.map(team => (
              <div key={team.id} className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1 text-xs font-medium">
                <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-5 h-3.5 object-cover rounded-sm" />
                {team.name} ({team.fifaCode})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All participants */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">
          Participantes ({selectedTeamIds.length} base + {repechajeTeamIds.length} repechaje)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-2 border border-border rounded-lg bg-card">
          {[...selectedTeamIds, ...repechajeTeamIds].map(id => {
            const team = availableTeams.find(t => t.id === id);
            if (!team) return null;
            const isRepechaje = repechajeTeamIds.includes(team.id);
            return (
              <div key={team.id} className={`flex items-center gap-2 p-1.5 border rounded-md text-xs ${isRepechaje ? "bg-secondary border-foreground/15" : "bg-card border-border"
                }`}>
                <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-6 h-4 object-cover rounded-sm ring-1 ring-border" />
                <span className="font-medium truncate">{team.name} ({team.fifaCode})</span>
                {isRepechaje && <span className="text-[9px] font-semibold text-field ml-auto">PK</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
