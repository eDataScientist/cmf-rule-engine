import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Table,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

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
    <div className="flex h-screen w-[280px] flex-col border-r" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}>
      {/* Branding */}
      <div className="flex h-16 items-center border-b px-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg" style={{ color: 'var(--color-foreground)' }}>Claims Engine</span>
        </div>
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
                    "w-full justify-start gap-3 px-3",
                    isActive
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Sign Out */}
      <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        {/* User Info */}
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

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-900/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
