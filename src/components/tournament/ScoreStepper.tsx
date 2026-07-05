import React from "react";

export function StepperButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

export function ScoreStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <StepperButton onClick={() => onChange(Math.max(0, value - 1))} disabled={disabled || value <= 0}>
        −
      </StepperButton>
      <span className="w-7 text-center font-display text-lg font-semibold tracking-tight">
        {value}
      </span>
      <StepperButton onClick={() => onChange(value + 1)} disabled={disabled}>
        +
      </StepperButton>
    </div>
  );
}
