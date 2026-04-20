import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Store, LogOut, UserCircle, Package, Settings, ShieldAlert, Menu, X, ShoppingCart } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../hooks/useSession';

const Layout = () => {
  const { signOut, user } = useAuth();
  const { user: sessionUser } = useSession();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'shop_owner' || user?.role === 'admin' ? '/dashboard/shop' : '/dashboard/patient';

  const navLinks = [
    { name: 'Dashboard', path: dashboardPath, icon: <LayoutDashboard size={19} /> },
    { name: 'Medicines', path: '/medicines', icon: <Pill size={19} /> },
    { name: 'Shops', path: '/shops', icon: <Store size={19} /> },
    ...(user?.role === 'patient'
      ? [{ name: 'My Orders', path: '/orders', icon: <ShoppingCart size={19} /> }]
      : []),
    ...(user?.role === 'shop_owner' || user?.role === 'admin'
      ? [
          { name: 'Inventory', path: '/inventory', icon: <Package size={19} /> },
          { name: 'Shop Settings', path: '/shop-settings', icon: <Settings size={19} /> }
        ]
      : []),
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Panel', path: '/dashboard/admin', icon: <ShieldAlert size={19} /> }]
      : []),
    { name: 'Profile', path: '/profile', icon: <UserCircle size={19} /> }
  ];

  const roleLabel = {
    patient: 'Patient',
    shop_owner: 'Shop Owner',
    admin: 'Administrator',
  }[sessionUser?.role ?? user?.role] ?? (sessionUser?.role ?? user?.role);

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-100/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <Pill size={18} className="text-white" />
          </div>
          <div>
            <span className="text-[17px] font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
              Meditrack
            </span>
            <span className="block text-[10px] text-indigo-500 font-bold uppercase tracking-widest leading-none">Pro</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navLinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-slate-100/80 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{roleLabel}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f6ff' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '14px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } }
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="w-60 hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRight: '1.5px solid #e8eaf6' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 h-full flex flex-col bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile top bar - shows on mobile */}
        <header className="h-14 flex items-center px-4 justify-between md:hidden flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1.5px solid #e8eaf6', paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Pill size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-[15px]" style={{ fontFamily: 'Outfit, sans-serif' }}>Meditrack</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </div>

        {/* ── Mobile bottom tab bar ──────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', borderTop: '1.5px solid #e8eaf6', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0.375rem 0.5rem 0.25rem' }}>
            {[
              { path: dashboardPath, icon: LayoutDashboard, label: 'Home' },
              { path: '/medicines',   icon: Pill,            label: 'Medicines' },
              { path: '/shops',       icon: Store,           label: 'Shops' },
              ...(user?.role === 'patient'
                ? [{ path: '/orders', icon: ShoppingCart, label: 'Orders' }]
                : user?.role === 'shop_owner'
                ? [{ path: '/inventory', icon: Package, label: 'Inventory' }]
                : []
              ),
              { path: '/profile',    icon: UserCircle,      label: 'Profile' },
            ].map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-all duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div style={{
                      width: 36, height: 36, borderRadius: '0.75rem',
                      background: isActive ? '#eef2ff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <Icon size={21} strokeWidth={isActive ? 2.5 : 1.75} />
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em', lineHeight: 1 }}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
