interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 px-8 py-10 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-500">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.5rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
