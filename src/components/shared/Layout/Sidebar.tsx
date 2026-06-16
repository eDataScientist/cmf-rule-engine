import { useEffect, useMemo, useState } from 'react';
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
  ChevronRight,
  ListChecks,
  Building2,
  Users,
  ScrollText,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/lib/auth/context';
import { sidebarCollapsedAtom } from '@/store/atoms/ui';
import { supabase } from '@/lib/db/supabase';
import ClaimCPULogo from '@/assets/claims_cpu_logo.jpeg';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const mainNavItems: NavItem[] = [
  { path: '/review-trees', label: 'Decision Trees', icon: LayoutDashboard, roles: ['admin', 'client_admin', 'client_user'] },
  { path: '/datasets', label: 'Datasets', icon: FileText, roles: ['admin', 'client_admin', 'client_user'] },
  { path: '/generate-tree', label: 'Generate Tree', icon: PlusCircle, roles: ['admin'] },
  { path: '/table-visualizer', label: 'Table Visualizer', icon: Table, roles: ['admin', 'client_admin', 'client_user'] },
  { path: '/rules', label: 'Rules', icon: ListChecks, roles: ['admin', 'client_admin', 'client_user'] },
];

const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { path: '/admin/companies', label: 'Companies', icon: Building2, roles: ['admin'] },
  { path: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/admin/logs', label: 'Logs', icon: ScrollText, roles: ['admin'] },
];

const companyNavItems: NavItem[] = [
  { path: '/company', label: 'Company Overview', icon: Building2, roles: ['client_admin'] },
  { path: '/company/users', label: 'My Company', icon: Users, roles: ['client_admin'] },
];

function isPathActive(currentPath: string, itemPath: string) {
  if (itemPath === '/admin') {
    return currentPath.startsWith('/admin');
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const [companyName, setCompanyName] = useState<string | null>(null);

  const role = profile?.role;

  const visibleMainItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return mainNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleAdminItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return adminNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleCompanyItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return companyNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    const loadCompanyName = async () => {
      if (!profile?.company_id) {
        setCompanyName(null);
        return;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to load company name', error);
        setCompanyName(null);
        return;
      }

      setCompanyName(data?.name ?? null);
    };

    void loadCompanyName();

    return () => {
      isMounted = false;
    };
  }, [profile?.company_id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userRoleLabel =
    profile?.role === 'admin'
      ? 'Admin'
      : profile?.role === 'client_admin'
        ? 'Client Admin'
        : profile?.role === 'client_user'
          ? 'Client User'
          : null;

  const initials = userName
    .split(/[\s._-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const renderNavSection = (items: NavItem[], sectionTitle?: string) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1">
        {sectionTitle && !isCollapsed && (
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{sectionTitle}</p>
        )}
        {items.map((item) => {
          const active = isPathActive(location.pathname, item.path);

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full gap-3 px-3',
                  isCollapsed ? 'justify-center' : 'justify-start',
                  active
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn('flex h-screen flex-col border-r transition-all duration-300', isCollapsed ? 'w-[80px]' : 'w-[280px]')}
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
    >
      <div className="flex h-16 items-center justify-between border-b px-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 overflow-hidden font-semibold tracking-tight">
          <img src={ClaimCPULogo} alt="ClaimCPU" className="h-8 w-auto flex-shrink-0 object-contain" />
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

      <div className="flex-1 space-y-5 overflow-y-auto py-6">
        <nav className="space-y-5 px-4">
          {renderNavSection(visibleMainItems)}
          {renderNavSection(visibleAdminItems, 'Admin')}
          {renderNavSection(visibleCompanyItems, 'My Company')}
        </nav>
      </div>

      <div className="space-y-3 border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {userName}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.email}
              </p>
              {userRoleLabel && (
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {userRoleLabel}
                  {profile?.role === 'client_user' && companyName ? ` - ${companyName}` : ''}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              {initials}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn('w-full gap-3 text-zinc-400 hover:bg-red-900/10 hover:text-red-400', isCollapsed ? 'justify-center px-0' : 'justify-start')}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
