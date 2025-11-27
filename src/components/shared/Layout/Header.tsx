import { useAtom } from 'jotai';
import { Link, useLocation } from 'react-router-dom';
import { uiThemeAtom } from '@/store/atoms/ui';
import { headerBreadcrumbsAtom, headerActionsAtom } from '@/store/atoms/header';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ChevronRight } from 'lucide-react';

const defaultRouteConfig: Record<string, { breadcrumbs: { label: string; href?: string }[] }> = {
  '/review-trees': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Decision Trees' }] },
  '/datasets': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Datasets' }] },
  '/generate-tree': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Generate Tree' }] },
  '/table-visualizer': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Table Visualizer' }] },
};

export function Header() {
  const [uiTheme, setUiTheme] = useAtom(uiThemeAtom);
  const [customBreadcrumbs] = useAtom(headerBreadcrumbsAtom);
  const [customActions] = useAtom(headerActionsAtom);
  const location = useLocation();

  const toggleTheme = () => {
    setUiTheme(uiTheme === 'light' ? 'dark' : 'light');
  };

  // Use custom breadcrumbs if set, otherwise use default route config
  const breadcrumbs = customBreadcrumbs ||
    defaultRouteConfig[location.pathname]?.breadcrumbs ||
    [{ label: 'Home' }];

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-6 backdrop-blur-sm"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{
                color: index === breadcrumbs.length - 1
                  ? 'var(--color-foreground)'
                  : 'var(--color-text-secondary)'
              }}>
                {crumb.label}
              </span>
            )}
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Actions - custom or default theme toggle */}
      <div className="flex items-center gap-3">
        {customActions}
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
