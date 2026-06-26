import { Input } from "@/components/ui/input";
import { Template } from "@/types";

interface WizardStep1GeneralProps {
  name: string;
  setName: (name: string) => void;
  type: "official" | "custom";
  setType: (type: "official" | "custom") => void;
  subType: string;
  setSubType: (subType: string) => void;
  teamsCount: number | "";
  setTeamsCount: (count: number | "") => void;
  customQuotas: Record<string, number | "">;
  setCustomQuotas: (quotas: Record<string, number | "">) => void;
  templates: Record<string, Template>;
  customQuotasSum: number;
  isCustomQuotaValid: boolean;
  setSelectedTeamIds: (ids: string[]) => void;
  setHostIds: (ids: string[]) => void;
  setRepechajeTeamIds: (ids: string[]) => void;
}

export function WizardStep1General({
  name,
  setName,
  type,
  setType,
  subType,
  setSubType,
  teamsCount,
  setTeamsCount,
  customQuotas,
  setCustomQuotas,
  templates,
  customQuotasSum,
  isCustomQuotaValid,
  setSelectedTeamIds,
  setHostIds,
  setRepechajeTeamIds,
}: WizardStep1GeneralProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Nombre del Torneo</label>
        <Input
          placeholder="Ej. Copa del Mundo 2026, Eurocopa 2028..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-11 border-0 border-b border-border bg-transparent rounded-none px-0 text-base focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Tipo de Torneo</label>
          <select
            className="h-11 w-full appearance-none border-0 border-b border-border bg-transparent px-0 text-base outline-none focus:border-foreground"
            value={type}
            onChange={e => setType(e.target.value as "official" | "custom")}
          >
            <option value="official">Torneo Oficial (FIFA Rules)</option>
            <option value="custom">Torneo Personalizado</option>
          </select>
        </div>

        {type === "official" ? (
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Plantilla Oficial</label>
            <select
              className="h-11 w-full appearance-none border-0 border-b border-border bg-transparent px-0 text-base outline-none focus:border-foreground"
              value={subType}
              onChange={e => setSubType(e.target.value)}
            >
              {Object.entries(templates).map(([key, val]) => (
                <option key={key} value={key}>{val.name} ({val.teamsCount} equipos)</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Total de Equipos</label>
            <Input
              type="number" min={4} max={96} value={teamsCount}
              onChange={e => {
                const val = e.target.value;
                setTeamsCount(val === "" ? "" : Number(val));
                setSelectedTeamIds([]); setHostIds([]); setRepechajeTeamIds([]);
              }}
              className="h-11 border-0 border-b border-border bg-transparent rounded-none px-0 text-base focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>
        )}
      </div>

      {type === "custom" && (
        <div className="p-4 border border-border rounded-lg bg-secondary/40 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground">Plazas por Confederación</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${customQuotasSum === (Number(teamsCount) || 0) ? "bg-field/10 text-field" : "bg-destructive/10 text-destructive"
              }`}>
              {customQuotasSum} / {teamsCount === "" ? 0 : teamsCount}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.keys(customQuotas).map(confed => (
              <div key={confed} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block text-center">{confed}</label>
                <Input
                  type="number" min={0} value={customQuotas[confed]}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomQuotas({ ...customQuotas, [confed]: val === "" ? "" : Number(val) });
                    setSelectedTeamIds([]); setHostIds([]); setRepechajeTeamIds([]);
                  }}
                  className="text-center h-8"
                />
              </div>
            ))}
          </div>
          {!isCustomQuotaValid && (
            <p className="text-xs text-destructive font-medium text-center">
              * La suma debe ser exactamente {teamsCount === "" ? 0 : teamsCount} equipos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
