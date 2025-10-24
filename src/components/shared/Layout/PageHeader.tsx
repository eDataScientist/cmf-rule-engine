interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/70 px-8 py-10 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur-lg">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(127,139,228,0.18),_transparent_60%)]" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <span className="mt-1 h-20 w-1 rounded-full bg-gradient-to-b from-primary via-primary/40 to-transparent" />
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
