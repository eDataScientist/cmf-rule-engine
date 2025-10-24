import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

const navItems = [
  { path: '/review-trees', label: 'Decision Trees' },
  { path: '/generate-tree', label: 'Generate Tree' },
  { path: '/table-visualizer', label: 'Table Visualizer' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="relative z-20 flex justify-center px-6 pt-8 lg:px-10">
      <nav className="w-full max-w-6xl rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-sky-400/70 to-primary/50 text-background shadow-[0_12px_25px_rgba(59,130,246,0.35)] transition-transform duration-300 group-hover:-translate-y-1">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-white via-sky-100 to-white bg-clip-text text-lg font-semibold tracking-tight text-transparent">
                Claims Rule Engine
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground/70">
                Intelligent Decisions
              </span>
            </div>
          </Link>

          <div className="flex items-center justify-end gap-2 md:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-inner shadow-white/5 backdrop-blur">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'group relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-primary via-sky-400/80 to-primary/60 text-background shadow-[0_18px_35px_-25px_rgba(59,130,246,0.85)]'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {!isActive && (
                      <span className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="absolute inset-0 bg-white/10" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
