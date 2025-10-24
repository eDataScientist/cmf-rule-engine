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
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <Link to="/" className="group flex items-center gap-4">
          <span className="grid h-12 w-12 place-content-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold uppercase tracking-[0.4em] text-primary">
              Claims
            </span>
            <span className="block text-xs uppercase tracking-[0.55em] text-muted-foreground">
              Rule Engine
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/50 bg-white/70 p-1.5 shadow-inner shadow-black/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative overflow-hidden rounded-full px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] transition-all duration-300 ease-out',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'relative z-10 transition-colors duration-300 group-hover:text-primary-foreground',
                    isActive ? 'text-primary-foreground' : undefined
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    'absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary/70 opacity-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100',
                    isActive && 'scale-x-100 opacity-100'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
