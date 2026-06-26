import { useDraggable } from "@dnd-kit/core";

export function DraggableTeamHandle({ teamId }: { teamId: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: teamId });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing touch-none ${isDragging ? "opacity-30" : ""}`}
      aria-label={`Arrastrar ${teamId}`}
    />
  );
}
