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
    <nav className="sticky top-0 z-40 py-6">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-6 py-4 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-500">
          <Link
            to="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-500 group-hover:scale-110">
              <Activity className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-semibold md:text-lg">Claims Rule Engine</span>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Decision Intelligence</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 ease-out',
                    'text-muted-foreground hover:text-foreground hover:shadow-md hover:shadow-primary/20',
                    isActive && 'bg-primary/15 text-primary shadow-sm shadow-primary/30'
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={cn(
                      'pointer-events-none absolute inset-0 scale-0 bg-primary/10 opacity-0 transition-all duration-300 ease-out',
                      isActive && 'scale-105 opacity-100'
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
