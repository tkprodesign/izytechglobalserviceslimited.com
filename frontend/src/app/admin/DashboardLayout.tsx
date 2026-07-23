import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { getUser, removeToken, isDeveloper } from '../../lib/auth';
import {
  LayoutDashboard,
  Mail,
  FileText,
  Terminal,
  LogOut,
  Activity,
  Inbox,
  Share2,
  ShoppingBag,
  ClipboardList,
  Milestone,
  UserCircle,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface NavigationItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  developer?: boolean;
}

export function DashboardLayout({ children }: Props) {
  const user = getUser();
  const navigate = useNavigate();
  const dev = isDeveloper();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('admin-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    if (!sidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSidebarOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  function logout() {
    removeToken();
    navigate('/admin/login');
  }

  const managementItems: NavigationItem[] = [
    { to: dev ? '/dev/dashboard' : '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/contacts', label: 'Contacts', icon: Mail },
    { to: '/admin/quotes', label: 'Quote Requests', icon: FileText },
    { to: '/admin/socials', label: 'Social Media', icon: Share2 },
    { to: '/admin/products', label: 'Store Products', icon: ShoppingBag },
    { to: '/admin/enquiries', label: 'Store Enquiries', icon: ClipboardList },
    { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
    { to: '/admin/milestones', label: 'Milestones', icon: Milestone },
    { to: '/admin/founder', label: 'Founder Profile', icon: UserCircle },
    { to: '/dev/email', label: 'Email Manager', icon: Inbox },
  ];

  const developerItems: NavigationItem[] = [
    { to: '/dev/dashboard', label: 'System Status', icon: Activity },
    { to: '/dev/logs', label: 'System Info', icon: Terminal },
  ];

  const navBase = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all';

  function renderNavItem(item: NavigationItem, developer = false) {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        title={item.label}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:bg-white/5 hover:text-white'}`
        }
        style={({ isActive }) =>
          isActive ? { background: developer ? 'rgba(242,101,34,0.8)' : 'var(--izy-blue)' } : {}
        }
      >
        <Icon size={17} className="flex-shrink-0" />
        <span className="admin-sidebar-label">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div
      className="admin-shell flex min-h-screen"
      data-sidebar-collapsed={sidebarCollapsed}
      style={{ background: '#f0f3f8' }}
    >
      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        className={`admin-sidebar-backdrop fixed inset-0 z-40 bg-[#041627]/55 md:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(16rem,calc(100vw-1rem))] flex-shrink-0 flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:relative md:z-auto md:w-64 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'
        }`}
        style={{ background: 'var(--izy-navy)', minHeight: '100vh' }}
      >
        <div className="flex items-center justify-between border-b px-4 py-5 md:px-5 md:py-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: 'var(--izy-blue)' }}
            >
              IZY
            </div>
            <div className="admin-sidebar-label min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-white">Control Panel</p>
              <p className="mt-0.5 truncate text-xs" style={{ color: '#8fadc8' }}>
                {dev ? 'Developer Access' : 'Admin Access'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="admin-sidebar-toggle hidden rounded-lg p-2 text-[#8fadc8] transition-colors hover:bg-white/10 hover:text-white md:block"
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              window.localStorage.setItem('admin-sidebar-collapsed', String(next));
            }}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[#8fadc8] hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="admin-sidebar-label mb-2 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6a85' }}>
            Management
          </p>
          {managementItems.map(item => renderNavItem(item))}

          {dev && (
            <>
              <p className="admin-sidebar-label mb-2 mt-5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6a85' }}>
                Developer
              </p>
              {developerItems.map(item => renderNavItem(item, true))}
            </>
          )}
        </nav>

        <div className="border-t px-3 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="mb-1 flex items-center gap-3 px-4 py-2">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: dev ? 'var(--izy-orange)' : 'var(--izy-blue)' }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="admin-sidebar-label min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.email}</p>
              <p className="text-xs capitalize" style={{ color: '#8fadc8' }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className={`${navBase} w-full text-[#8fadc8] hover:bg-white/5 hover:text-white`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            <span className="admin-sidebar-label">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <header className="admin-mobile-header sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 md:hidden" style={{ borderColor: '#eef1f6' }}>
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-lg p-2 text-[#0d1b2e] hover:bg-[#f0f3f8]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--izy-navy)' }}>Control Panel</p>
            <p className="text-[11px]" style={{ color: '#8fadc8' }}>{dev ? 'Developer Access' : 'Admin Access'}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}