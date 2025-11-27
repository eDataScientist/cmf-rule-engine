import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Table,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { sidebarCollapsedAtom } from '@/store/atoms/ui';
import CMFLogo from '@/assets/cmf_dark.svg';

const navItems = [
  { path: '/review-trees', label: 'Decision Trees', icon: LayoutDashboard },
  { path: '/datasets', label: 'Datasets', icon: FileText },
  { path: '/generate-tree', label: 'Generate Tree', icon: PlusCircle },
  { path: '/table-visualizer', label: 'Table Visualizer', icon: Table },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Get user display name from email (part before @)
  const userName = user?.email?.split('@')[0] || 'User';

  // Get user initials for avatar
  const initials = userName
    .split(/[\s._-]/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
    >
      {/* Branding */}
      <div className="flex h-16 items-center border-b px-6 justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 font-semibold tracking-tight overflow-hidden">
          <img src={CMFLogo} alt="CMF Logo" className="h-12 w-12 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-lg whitespace-nowrap" style={{ color: 'var(--color-foreground)' }}>CMF</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 flex-shrink-0"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Sign Out */}
      <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        {/* User Info */}
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-2">
            {/* Avatar with Initials */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
              {initials}
            </div>
            {/* User Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                {userName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
              {initials}
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-900/10",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
