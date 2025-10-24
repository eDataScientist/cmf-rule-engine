interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-white/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-12 translate-y-12 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
      </div>
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-muted-foreground/80">
            Overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-inner shadow-white/5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
