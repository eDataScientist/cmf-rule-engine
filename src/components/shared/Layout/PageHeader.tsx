interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-8 shadow-xl shadow-black/5 backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-0 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-60px] right-4 h-40 w-40 rounded-full bg-secondary/30 blur-[120px]" />
      </div>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <h1 className="relative text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {title}
            <span className="absolute -bottom-4 left-0 h-[3px] w-16 rounded-full bg-gradient-to-r from-primary to-primary/30" />
          </h1>
          {description && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
