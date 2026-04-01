import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, TrendingUp, Wallet,
  RefreshCw, Settings, LogOut, Bell, Search,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Onboarding from './Onboarding';
import './Layout.css';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/accounts',     icon: CreditCard,      label: 'Accounts'     },
  { to: '/analytics',    icon: TrendingUp,      label: 'Analytics'    },
  { to: '/budgets',      icon: Wallet,          label: 'Budgets'      },
  { to: '/transactions', icon: RefreshCw,       label: 'Transactions' },
];

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout }  = useAuth();
  const { accounts, transactions, budgets } = useApp();

  // Show onboarding once — when user has no data yet
  useEffect(() => {
    if (!user) return;
    const key = `aura_onboarded_${user.id}`;
    const hasSeen = localStorage.getItem(key);
    const hasData = accounts.length > 0 || transactions.length > 0 || budgets.length > 0;
    if (!hasSeen && !hasData) {
      // Small delay so the page loads first
      const t = setTimeout(() => setShowOnboard(true), 800);
      return () => clearTimeout(t);
    }
  }, [user?.id, accounts.length, transactions.length, budgets.length]);

  const handleCloseOnboard = () => {
    if (user) localStorage.setItem(`aura_onboarded_${user.id}`, '1');
    setShowOnboard(false);
  };

  // Avatar initials from name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AU';

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="gradient-text" style={{ fontWeight: 900, fontSize: '1.25rem' }}>A</span>
        </div>
        {(!collapsed || isMobile) && (
          <div className="logo-text">
            <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Aura</span>
            <span style={{ color: 'var(--outline)', fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Finance</span>
          </div>
        )}
        {isMobile && (
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        )}
      </div>

      {(!collapsed || isMobile) && (
        <div className="curator-badge">
          <div className="pulse-dot" />
          <span>The Digital Curator</span>
        </div>
      )}

      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '2rem' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            {(!collapsed || isMobile) && <span>{label}</span>}
          </NavLink>
        ))}
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            {(!collapsed || isMobile) && <span>{label}</span>}
          </NavLink>
        ))}
        <button className="nav-item nav-item-btn" onClick={handleLogout} style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
          <LogOut size={18} />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </nav>

      {!isMobile && (
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </>
  );

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

      {/* Onboarding wizard */}
      {showOnboard && <Onboarding onClose={handleCloseOnboard} />}

      {/* Mobile Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside className={`sidebar mobile-sidebar ${mobileOpen ? 'open' : ''}`}>
        <SidebarContent isMobile />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="topbar-search">
            <Search size={16} style={{ color: 'var(--outline)' }} />
            <input type="text" placeholder="Search transactions, accounts..." style={{ background: 'transparent', border: 'none', flex: 1, color: 'var(--on-surface)' }} />
          </div>

          <div className="topbar-actions">
            <button className="ghost-btn" style={{ padding: '0.5rem 0.65rem', fontSize: '0.875rem', position: 'relative' }}>
              <Bell size={16} />
              <span className="notif-dot" />
            </button>
            {/* Real user initials */}
            <div className="avatar" title={user?.name}>{initials}</div>
          </div>
        </header>

        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
