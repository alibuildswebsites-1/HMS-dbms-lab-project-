import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BedDouble, CalendarCheck, 
  CreditCard, Briefcase, LogOut, User, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/rooms', label: 'Rooms', icon: BedDouble },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/employees', label: 'Employees', icon: Briefcase },
  ];

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#01411C] text-white transition-transform duration-300 ease-in-out shadow-xl flex flex-col
        md:translate-x-0 md:static md:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between md:justify-center border-b border-white/10">
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold tracking-wider">GREENLEAF</h1>
            <span className="text-xs text-[#FDB913] font-medium tracking-widest">HOTEL & RESORT</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#FDB913] text-[#01411C] font-semibold shadow-md'
                    : 'text-gray-100 hover:bg-white/10 hover:text-[#FDB913]'
                }`
              }
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-[#01411C] md:hidden"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-[#01411C] truncate">{title}</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#01411C] text-[#FDB913] flex items-center justify-center font-bold">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 overflow-y-auto flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};