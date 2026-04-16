import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Store, LogOut, UserCircle, Package, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../hooks/useSession';

const Layout = () => {
  const { signOut, user } = useAuth();
  const { user: sessionUser } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'shop_owner' || user?.role === 'admin' ? '/dashboard/shop' : '/dashboard/patient';

  const navLinks = [
    { name: 'Dashboard', path: dashboardPath, icon: <LayoutDashboard size={20} /> },
    { name: 'Medicines', path: '/medicines', icon: <Pill size={20} /> },
    { name: 'Shops Directory', path: '/shops', icon: <Store size={20} /> },
    ...(user?.role === 'shop_owner' || user?.role === 'admin'
      ? [
          { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
          { name: 'Shop settings', path: '/shop-settings', icon: <Settings size={20} /> }
        ]
      : []),
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex z-10 gap-2 items-center text-blue-600 font-bold text-xl">
             <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Pill size={20} />
             </div>
             Meditrack
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {user && (
            <div className="mb-4 px-4">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{sessionUser?.role ?? user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 md:hidden justify-between">
           <div className="flex gap-2 items-center text-blue-600 font-bold text-lg">
             <Pill size={20} /> Meditrack
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500">
            <LogOut size={20} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
