type StepIndicatorProps = {
  step: 1 | 2 | 3;
};

const labels = ["Meny", "Kasse", "Bekreftet"];

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, index) => {
        const current = index + 1;
        const active = current <= step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold uppercase tracking-[0.12em] ${
                active
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-black"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
              }`}
            >
              {current}
            </div>
            <span className="hidden text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] sm:inline">
              {label}
            </span>
            {current < 3 ? (
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
