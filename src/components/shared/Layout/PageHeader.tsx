interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-8 shadow-[0_20px_45px_rgba(70,82,186,0.08)] backdrop-blur-xl">
      <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-[#f8d8b5]/40 blur-2xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Overview</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-transparent bg-gradient-to-r from-[#243a73] via-[#3d4d9d] to-[#7b8bff] bg-clip-text">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}
