import {
  DndContext,
  DragOverlay,
  closestCenter,
  SensorDescriptor,
  SensorOptions,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Team } from "@/types";
import { getFlagSvgUrl } from "@/lib/utils";
import { SLOT_DROP_ID_PREFIX } from "@/lib/constants";
import { PotColumn } from "./PotColumn";
import { DroppableSlot } from "./DroppableSlot";

interface WizardStep5DrawProps {
  drawMode: "auto" | "manual";
  setDrawMode: (mode: "auto" | "manual") => void;
  assignedTeamIds: Set<string>;
  totalTeamsExpected: number;
  dropError: string | null;
  setDropError: (error: string | null) => void;
  pots: Team[][];
  numGroups: number;
  manualGroups: Record<number, string[]>;
  availableTeams: Team[];
  activeDragTeamId: string | null;
  activeDragTeam: Team | null;
  shakingSlotId: string | null;
  shakeCounter: number;
  getAssignedGroupName: (teamId: string) => string | undefined;
  getSlotInvalidity: (gIndex: number, sIndex: number, teamId: string) => { invalid: boolean; reason?: "occupied" | "pot" | "confed" };
  removeFromGroup: (gIndex: number, sIndex: number) => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragCancel: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}

export function WizardStep5Draw({
  drawMode,
  setDrawMode,
  assignedTeamIds,
  totalTeamsExpected,
  dropError,
  setDropError,
  pots,
  numGroups,
  manualGroups,
  availableTeams,
  activeDragTeamId,
  activeDragTeam,
  shakingSlotId,
  shakeCounter,
  getAssignedGroupName,
  getSlotInvalidity,
  removeFromGroup,
  handleDragStart,
  handleDragCancel,
  handleDragEnd,
  sensors,
}: WizardStep5DrawProps) {
  const makeSlotDropId = (gIndex: number, sIndex: number): string => {
    return `${SLOT_DROP_ID_PREFIX}${gIndex}-${sIndex}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-full max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setDrawMode("auto")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${drawMode === "auto" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Automático
        </button>
        <button
          type="button"
          onClick={() => setDrawMode("manual")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${drawMode === "manual" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Manual
        </button>
      </div>

      {drawMode === "auto" ? (
        <div className="text-center p-6 border border-border rounded-lg bg-secondary/40 space-y-3">
          <h3 className="font-semibold text-foreground">Sorteo Automático Activado</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            El sistema generará los grupos aleatoriamente respetando los bombos y (en lo posible) evitando cruces de la misma confederación en la fase de grupos.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-secondary/40 border border-border rounded-lg text-xs text-muted-foreground font-medium">
              <span>
                <strong className="text-foreground">Sorteo Manual:</strong> arrastra desde los <strong className="text-foreground">Bombos</strong> (izquierda) hacia un <strong className="text-foreground">Grupo</strong> (derecha).
              </span>
              <span>•</span>
              <span>Máx. <strong className="text-foreground">1 por bombo</strong> en cada grupo.</span>
              <span>•</span>
              <span className="ml-auto font-mono text-foreground">
                {assignedTeamIds.size} / {totalTeamsExpected} asignados
              </span>
            </div>

            {dropError && (
              <div className="p-2.5 bg-destructive/10 border border-destructive/30 rounded-md text-xs text-destructive font-medium flex items-center gap-2">
                <span>⚠</span>
                <span className="flex-1">{dropError}</span>
                <button
                  type="button"
                  onClick={() => setDropError(null)}
                  className="text-destructive/70 hover:text-destructive font-bold text-sm leading-none"
                  aria-label="Cerrar mensaje"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-3">
              {/* ─── Bombos (left column) ─── */}
              <div className="lg:w-64 xl:w-72 shrink-0 lg:max-h-[calc(100vh-300px)] lg:overflow-y-auto pr-1 space-y-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sticky top-0 bg-background py-1 z-10">
                  Bombos
                </h3>
                <div className="space-y-2">
                  {pots.map((pot, pIndex) => (
                    <PotColumn
                      key={pIndex}
                      potIndex={pIndex}
                      pot={pot}
                      assignedTeamIds={assignedTeamIds}
                      getAssignedGroupName={getAssignedGroupName}
                      activeDragTeamId={activeDragTeamId}
                    />
                  ))}
                </div>
              </div>

              {/* ─── Grupos (right column) ─── */}
              <div className="flex-1 min-w-0 lg:max-h-[calc(100vh-300px)] lg:overflow-y-auto pr-1 space-y-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sticky top-0 bg-background py-1 z-10">
                  Grupos
                </h3>
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2 transition-all duration-200 ${activeDragTeamId ? "gap-3" : ""}`}>
                  {Array.from({ length: numGroups }).map((_, gIndex) => {
                    const groupName = String.fromCharCode(65 + gIndex);
                    const currentGroup = manualGroups[gIndex] || [];
                    return (
                      <div
                        key={gIndex}
                        className="p-2 border border-border rounded-lg bg-card"
                      >
                        <h4 className="font-semibold text-center border-b border-border pb-1 mb-1.5 text-[11px] tracking-wider">
                          Grupo {groupName}
                        </h4>
                        <div className={`grid grid-cols-4 gap-1 transition-all duration-200 ${activeDragTeamId ? "gap-1.5" : ""}`}>
                          {Array.from({ length: 4 }).map((_, sIndex) => {
                            const teamId = currentGroup[sIndex] || "";
                            const team = teamId ? availableTeams.find(t => t.id === teamId) || null : null;
                            const dropId = makeSlotDropId(gIndex, sIndex);
                            const invalidity = activeDragTeamId
                              ? getSlotInvalidity(gIndex, sIndex, activeDragTeamId)
                              : { invalid: false };
                            return (
                              <div key={sIndex} className="flex flex-col items-stretch gap-0.5 min-h-[68px]">
                                <span className="text-[8px] font-mono text-muted-foreground leading-none text-center">
                                  {sIndex + 1}
                                </span>
                                <DroppableSlot
                                  dropId={dropId}
                                  team={team}
                                  isShaking={shakingSlotId === dropId}
                                  shakeKey={shakeCounter}
                                  onRemove={() => removeFromGroup(gIndex, sIndex)}
                                  isInvalidDuringDrag={invalidity.invalid}
                                  isDragActive={!!activeDragTeamId}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragTeam ? (
              <div className="w-10 h-10 rounded-md border-2 border-foreground/50 bg-card overflow-hidden shadow-2xl cursor-grabbing rotate-3 ring-2 ring-field/50">
                <img
                  src={getFlagSvgUrl(activeDragTeam.fifaCode)}
                  alt={activeDragTeam.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
