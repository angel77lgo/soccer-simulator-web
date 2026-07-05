interface StepProgressProps {
  step: number;
  setStep: (step: number) => void;
  stepLabels: { num: number; label: string }[];
}

export function StepProgress({ step, setStep, stepLabels }: StepProgressProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
      {stepLabels.map(({ num, label }, i) => {
        const isActive = step === num;
        // Since steps might not be contiguous, we check if current step is greater than this step's num
        const isDone = step > num;
        return (
          <li key={num} className="flex items-center gap-2">
            <button
              onClick={() => setStep(num)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : isDone
                  ? "text-foreground hover:bg-secondary"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full font-mono text-[10px] ${
                isActive
                  ? "bg-background/20"
                  : isDone
                  ? "bg-field/10 text-field"
                  : "bg-secondary"
              }`}>
                {isDone ? "✓" : (i + 1)}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < stepLabels.length - 1 && (
              <span className="text-muted-foreground/30">/</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
