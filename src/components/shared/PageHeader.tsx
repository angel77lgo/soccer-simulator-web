interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-4xl font-display font-semibold leading-[0.9] tracking-tight md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </header>
  );
}
