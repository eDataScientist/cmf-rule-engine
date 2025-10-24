interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
      <div className="pointer-events-none absolute right-10 top-[-60px] h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute left-10 bottom-[-70px] h-36 w-36 rounded-full bg-sky-200/40 blur-2xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            CMF Platform
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 md:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
