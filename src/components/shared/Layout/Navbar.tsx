import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Activity, Heart } from 'lucide-react';
import { useAtom } from 'jotai';
import { appThemeAtom } from '@/store/atoms/ui';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/review-trees', label: 'Decision Trees' },
  { path: '/datasets', label: 'Datasets' },
  { path: '/generate-tree', label: 'Generate Tree' },
  { path: '/table-visualizer', label: 'Table Visualizer' },
];

export function Navbar() {
  const location = useLocation();
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);

  const toggleTheme = () => {
    setAppTheme(appTheme === 'motor' ? 'medical' : 'motor');
  };

  const ThemeIcon = appTheme === 'motor' ? Activity : Heart;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
              <ThemeIcon className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Claims Rule Engine
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-white/60 bg-white/70 p-1 shadow-lg shadow-slate-200/50 backdrop-blur">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-sky-400 text-primary-foreground shadow-md shadow-sky-200/60'
                        : 'text-muted-foreground hover:text-foreground hover:shadow-sm hover:shadow-slate-200/60'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border-white/60 bg-white/70 backdrop-blur"
            >
              {appTheme === 'motor' ? (
                <>
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Motor</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Medical</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
