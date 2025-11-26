import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  PlusCircle,
  Table2,
  Activity,
  Heart,
  LogOut
} from 'lucide-react';
import { useAtom } from 'jotai';
import { appThemeAtom } from '@/store/atoms/ui';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';

const navItems = [
  { path: '/review-trees', label: 'Review Trees', icon: LayoutGrid },
  { path: '/datasets', label: 'Datasets', icon: Activity },
  { path: '/generate-tree', label: 'Generate Tree', icon: PlusCircle },
  { path: '/table-visualizer', label: 'Table Visualizer', icon: Table2 },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);
  const { user, signOut } = useAuth();

  const toggleTheme = () => {
    setAppTheme(appTheme === 'motor' ? 'medical' : 'motor');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-white/80 backdrop-blur-xl transition-transform">
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <span className="font-heading text-xl font-bold">C</span>
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">
              CMF
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/5 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Settings */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="px-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
            >
              {appTheme === 'motor' ? (
                <Activity className="h-4 w-4" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              <span>{appTheme === 'motor' ? 'Motor Mode' : 'Medical Mode'}</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
