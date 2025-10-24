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
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link to="/" className="group flex items-center gap-3 text-foreground">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-[0_18px_40px_-20px_rgba(71,85,105,0.8)] transition-all duration-300 group-hover:-translate-y-[2px] group-hover:shadow-[0_26px_50px_-20px_rgba(71,85,105,0.65)]">
            <Activity className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-semibold leading-tight sm:text-2xl">
              Claims Rule Engine
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground opacity-80">
              Decision Intelligence
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-inner shadow-black/5 backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_16px_32px_-16px_rgba(71,85,105,0.85)]'
                    : 'text-muted-foreground hover:bg-white/70 hover:text-foreground'
                )}
              >
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
