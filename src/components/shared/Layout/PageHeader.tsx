interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_30px_80px_-45px_rgba(30,64,175,0.55)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200 via-blue-100 to-transparent opacity-80 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-cyan-200 via-blue-100 to-transparent opacity-90 blur-3xl" aria-hidden />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 shadow-sm">
            Overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="max-w-2xl text-base text-slate-600">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 self-start rounded-2xl border border-white/60 bg-white/70 p-2 shadow-inner backdrop-blur-xl md:self-auto">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
