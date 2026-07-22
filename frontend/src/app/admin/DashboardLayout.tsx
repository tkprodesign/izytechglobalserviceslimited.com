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
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const user = getUser();
  const navigate = useNavigate();
  const dev = isDeveloper();

  function logout() {
    removeToken();
    navigate('/admin/login');
  }

  const navBase =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all';

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f3f8' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ background: 'var(--izy-navy)', minHeight: '100vh' }}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'var(--izy-blue)' }}
            >
              IZY
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Control Panel</p>
              <p className="text-xs mt-0.5" style={{ color: '#8fadc8' }}>
                {dev ? 'Developer Access' : 'Admin Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a6a85' }}>
            Management
          </p>

          <NavLink
            to={dev ? '/dev/dashboard' : '/admin/dashboard'}
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/contacts"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <Mail size={16} />
            Contacts
          </NavLink>

          <NavLink
            to="/admin/quotes"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <FileText size={16} />
            Quote Requests
          </NavLink>

          <NavLink
            to="/admin/socials"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <Share2 size={16} />
            Social Media
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <ShoppingBag size={16} />
            Store Products
          </NavLink>

          <NavLink
            to="/admin/enquiries"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <ClipboardList size={16} />
            Store Enquiries
          </NavLink>

          <NavLink
            to="/dev/email"
            className={({ isActive }) =>
              `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--izy-blue)' } : {}}
          >
            <Inbox size={16} />
            Email Manager
          </NavLink>

          {dev && (
            <>
              <p className="px-4 text-xs font-semibold uppercase tracking-wider mb-2 mt-5" style={{ color: '#4a6a85' }}>
                Developer
              </p>
              <NavLink
                to="/dev/dashboard"
                end={false}
                className={({ isActive }) =>
                  `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(242,101,34,0.8)' } : {}}
              >
                <Activity size={16} />
                System Status
              </NavLink>

              <NavLink
                to="/dev/logs"
                className={({ isActive }) =>
                  `${navBase} ${isActive ? 'text-white' : 'text-[#8fadc8] hover:text-white hover:bg-white/5'}`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(242,101,34,0.8)' } : {}}
              >
                <Terminal size={16} />
                System Info
              </NavLink>
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 px-4 py-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: dev ? 'var(--izy-orange)' : 'var(--izy-blue)' }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.email}</p>
              <p className="text-xs capitalize" style={{ color: '#8fadc8' }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={`${navBase} w-full text-[#8fadc8] hover:text-white hover:bg-white/5`}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
