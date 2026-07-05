import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 20 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center py-24", className)}>
      <Loader2 className="animate-spin text-field/60" style={{ width: size, height: size }} />
    </div>
  );
}
