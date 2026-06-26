import { useDroppable } from "@dnd-kit/core";
import { Team } from "@/types";
import { POT_DROP_ID_PREFIX } from "@/lib/constants";
import { getFlagSvgUrl } from "@/lib/utils";
import { DraggableTeamHandle } from "./DraggableTeamHandle";

interface PotColumnProps {
  potIndex: number;
  pot: Team[];
  assignedTeamIds: Set<string>;
  getAssignedGroupName: (id: string) => string | undefined;
  activeDragTeamId: string | null;
}

export function PotColumn({
  potIndex,
  pot,
  assignedTeamIds,
  getAssignedGroupName,
  activeDragTeamId,
}: PotColumnProps) {
  const makePotDropId = (idx: number) => `${POT_DROP_ID_PREFIX}${idx}`;
  const { setNodeRef, isOver } = useDroppable({ id: makePotDropId(potIndex) });
  const assignedCount = pot.filter(t => assignedTeamIds.has(t.id)).length;

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg transition-colors ${
        isOver ? "border-foreground/40 bg-foreground/5" : "border-border bg-secondary/40"
      }`}
    >
      <div className="px-2 py-1.5 border-b border-border flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Bombo {potIndex + 1}
        </h4>
        <span className="text-[9px] font-mono text-muted-foreground">
          {pot.length - assignedCount}/{pot.length}
        </span>
      </div>
      <div className="p-1.5 space-y-1">
        {pot.map((team, i) => {
          const isAssigned = assignedTeamIds.has(team.id);
          const groupName = isAssigned ? getAssignedGroupName(team.id) : undefined;
          return (
            <div
              key={team.id}
              className={`relative ${isAssigned ? "opacity-45" : ""} ${activeDragTeamId === team.id ? "opacity-25" : ""}`}
            >
              <div
                className={`flex items-center gap-1.5 text-[11px] bg-card border rounded px-1.5 py-1 ${
                  isAssigned ? "border-border" : "border-border hover:border-foreground/30"
                }`}
                title={`${team.name} (${team.fifaCode})`}
              >
                <span className="text-[9px] text-muted-foreground w-3 text-right font-mono shrink-0">{i + 1}</span>
                <img src={getFlagSvgUrl(team.fifaCode)} alt={team.name} className="w-4 h-2.5 object-cover rounded-sm shrink-0" />
                <span className="font-medium truncate flex-1">{team.name}</span>
                {isAssigned && groupName && (
                  <span className="text-[8px] font-bold bg-field/15 text-field px-1 py-px rounded shrink-0">
                    {groupName.replace("Grupo ", "")}
                  </span>
                )}
              </div>
              {!isAssigned && <DraggableTeamHandle teamId={team.id} />}
            </div>
          );
        })}
        {pot.length === 0 && (
          <p className="text-[9px] text-muted-foreground text-center py-1">Vacío</p>
        )}
      </div>
    </div>
  );
}
