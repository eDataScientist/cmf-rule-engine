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
    <nav className="sticky top-0 z-30 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-5 py-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(59,130,246,0.35)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-inner">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
              Claims Rule Engine
            </span>
            <span className="hidden text-xs font-medium text-slate-500/90 sm:block">
              Intelligent decision support
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 text-white shadow-[0_12px_25px_-18px_rgba(14,116,144,0.65)]'
                    : 'text-slate-500 hover:text-slate-800 hover:shadow-[0_10px_30px_-25px_rgba(30,64,175,0.85)]'
                )}
              >
                <span>{item.label}</span>
                {isActive && <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-white/70 sm:inline">Active</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
