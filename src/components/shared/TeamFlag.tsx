import { getFlagSvgUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TeamFlagProps {
  code: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

export function TeamFlag({ code, size = "md", className, alt }: TeamFlagProps) {
  const sizeClasses = {
    sm: "h-3 w-4.5 rounded-[1px]",
    md: "h-5 w-7 rounded-sm",
    lg: "h-8 w-11 rounded-sm",
    xl: "h-12 w-16 rounded-md",
  };

  return (
    <span className={cn("flex shrink-0 overflow-hidden ring-1 ring-border", sizeClasses[size], className)}>
      <img
        src={getFlagSvgUrl(code)}
        alt={alt || code}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
