import { useEffect, useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Team } from "@/types";
import { getFlagSvgUrl } from "@/lib/utils";

interface DroppableSlotProps {
  dropId: string;
  team: Team | null;
  isShaking: boolean;
  shakeKey: number;
  onRemove: () => void;
  isInvalidDuringDrag?: boolean;
  isDragActive?: boolean;
}

export function DroppableSlot({
  dropId,
  team,
  isShaking,
  shakeKey,
  onRemove,
  isInvalidDuringDrag,
  isDragActive,
}: DroppableSlotProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropId });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: team?.id ?? `__empty_${dropId}`,
    disabled: !team,
  });

  const [localShakeKey, setLocalShakeKey] = useState(0);
  useEffect(() => {
    if (isShaking) setLocalShakeKey(k => k + 1);
  }, [isShaking, shakeKey]);

  // Build wrapper class with hover/drag states
  const wrapperClass = [
    "relative w-full h-full flex items-center justify-center p-1 rounded-md transition-all duration-150",
    isOver
      ? "bg-field/15 ring-2 ring-field ring-offset-1 ring-offset-card"
      : isDragActive && isInvalidDuringDrag
      ? "opacity-30"
      : isDragActive
      ? "bg-field/5 ring-1 ring-field/30"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (team) {
    const dragProps = { ...listeners, ...attributes };
    return (
      <div
        ref={setDropRef}
        key={`slot-wrap-${localShakeKey}`}
        className={wrapperClass}
      >
        <div
          ref={setDragRef}
          {...dragProps}
          className={`relative group w-full aspect-square rounded-md border border-foreground/20 bg-card overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ${
            isShaking ? "animate-shake" : ""
          } ${isDragging ? "opacity-30" : ""} ${
            isDragActive && isInvalidDuringDrag ? "scale-90 opacity-40" : ""
          }`}
          title={`${team.name} (${team.fifaCode})`}
        >
          <img
            src={getFlagSvgUrl(team.fifaCode)}
            alt={team.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5 pointer-events-none">
            <span className="text-[9px] font-mono font-semibold text-white block truncate">
              {team.fifaCode}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 cursor-pointer"
            aria-label="Quitar equipo del grupo"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setDropRef}
      key={`empty-wrap-${localShakeKey}`}
      className={wrapperClass}
    >
      <div
        className={`w-full aspect-square rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground transition-all duration-200 ${
          isOver
            ? "border-field bg-field/10"
            : isDragActive && isInvalidDuringDrag
            ? "border-destructive/30 bg-destructive/5 scale-90 opacity-40"
            : isDragActive
            ? "border-field/50 bg-field/5"
            : "border-border bg-secondary/30"
        } ${isShaking ? "animate-shake border-destructive" : ""}`}
        aria-label="Slot vacío – arrastra un equipo aquí"
      >
        <span className="text-lg font-light select-none">+</span>
      </div>
    </div>
  );
}
