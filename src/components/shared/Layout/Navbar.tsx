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
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="group flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/90 via-primary to-[#3a4a9e] text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Claims</span>
            <span className="text-2xl leading-none">Rule Engine Studio</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] shadow-primary/10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full',
                  'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  isActive
                    ? 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/80 hover:shadow-sm'
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
