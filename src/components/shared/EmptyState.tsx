import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Icon className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.25} />
      <div className="text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
