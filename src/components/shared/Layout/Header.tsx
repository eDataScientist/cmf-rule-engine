import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { uiThemeAtom } from '@/store/atoms/ui';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ChevronRight } from 'lucide-react';

const routeConfig: Record<string, { breadcrumbs: string[] }> = {
  '/review-trees': { breadcrumbs: ['Home', 'Decision Trees'] },
  '/datasets': { breadcrumbs: ['Home', 'Datasets'] },
  '/generate-tree': { breadcrumbs: ['Home', 'Generate Tree'] },
  '/table-visualizer': { breadcrumbs: ['Home', 'Table Visualizer'] },
};

export function Header() {
  const [uiTheme, setUiTheme] = useAtom(uiThemeAtom);
  const location = useLocation();

  const toggleTheme = () => {
    setUiTheme(uiTheme === 'light' ? 'dark' : 'light');
  };

  const currentRoute = routeConfig[location.pathname] || { 
    breadcrumbs: ['Home'] 
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b px-8 backdrop-blur-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
      {/* Breadcrumbs only */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {currentRoute.breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <span style={{ color: index === currentRoute.breadcrumbs.length - 1 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
              {crumb}
            </span>
            {index < currentRoute.breadcrumbs.length - 1 && (
              <ChevronRight className="h-3 w-3" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="gap-2 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {uiTheme === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
