import {
  DndContext,
  DragOverlay,
  closestCenter,
  SensorDescriptor,
  SensorOptions,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { Team } from "@/types";
import { getTeamLogoUrl } from "@/lib/utils";
import { DraggableTeamHandle } from "./DraggableTeamHandle";

interface WizardStep5BombosProps {
  pots: Team[][];
  defaultPotsSizes: number[];
  activeDragTeamId: string | null;
  activeDragTeam: Team | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragCancel: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}

function BomboColumn({
  potIndex,
  pot,
  targetSize,
  activeDragTeamId,
}: {
  potIndex: number;
  pot: Team[];
  targetSize: number;
  activeDragTeamId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `bombo-${potIndex}` });
  const isInvalidSize = pot.length !== targetSize;

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg transition-colors flex-1 min-w-[200px] ${
        isOver ? "border-foreground/40 bg-foreground/5" : "border-border bg-secondary/40"
      } ${isInvalidSize ? "border-destructive/50" : ""}`}
    >
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h4 className="text-sm font-semibold tracking-[0.1em] text-foreground">
          Bombo {potIndex + 1}
        </h4>
        <span className={`text-xs font-mono ${isInvalidSize ? "text-destructive" : "text-muted-foreground"}`}>
          {pot.length}/{targetSize}
        </span>
      </div>
      <div className="p-2 space-y-1.5 min-h-[150px]">
        {pot.map((team, i) => (
          <div
            key={team.id}
            className={`relative ${activeDragTeamId === team.id ? "opacity-25" : ""}`}
          >
            <div
              className="flex items-center gap-2 text-xs bg-card border rounded-md px-2 py-1.5 border-border hover:border-foreground/30 transition-colors"
              title={`${team.name} (${team.fifaCode})`}
            >
              <span className="text-[10px] text-muted-foreground w-4 text-right font-mono shrink-0">{i + 1}</span>
                        <div className="flex w-5 h-5 shrink-0 items-center justify-center bg-white p-0.5 rounded-sm">
                          <img src={getTeamLogoUrl(team)} alt={team.name} className="w-full h-full object-contain" />
                        </div>
              <span className="font-medium truncate flex-1">{team.name}</span>
            </div>
            <DraggableTeamHandle teamId={team.id} />
          </div>
        ))}
        {pot.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Arrastra un equipo aquí</p>
        )}
      </div>
    </div>
  );
}

export function WizardStep5Bombos({
  pots,
  defaultPotsSizes,
  activeDragTeamId,
  activeDragTeam,
  handleDragStart,
  handleDragCancel,
  handleDragEnd,
  sensors,
}: WizardStep5BombosProps) {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 border border-border rounded-lg bg-secondary/40 space-y-3">
        <h3 className="font-semibold text-foreground">Edición de Bombos</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Arrastra los equipos entre las columnas para cambiar su bombo. Asegúrate de que todos los bombos tengan exactamente la cantidad de equipos requerida antes de continuar.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-wrap gap-4">
          {pots.map((pot, pIndex) => (
            <BomboColumn
              key={pIndex}
              potIndex={pIndex}
              pot={pot}
              targetSize={defaultPotsSizes[pIndex]}
              activeDragTeamId={activeDragTeamId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragTeam ? (
            <div className="w-12 h-8 rounded-md border-2 border-foreground/50 bg-card overflow-hidden shadow-2xl cursor-grabbing rotate-3">
                <div className="flex w-10 h-10 items-center justify-center bg-white p-1">
                  <img
                    src={getTeamLogoUrl(activeDragTeam)}
                    alt={activeDragTeam.name}
                    className="w-full h-full object-contain"
                  />
                </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
