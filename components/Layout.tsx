import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BedDouble, CalendarCheck, 
  CreditCard, Briefcase, LogOut, Bell, User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/rooms', label: 'Rooms', icon: BedDouble },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/employees', label: 'Employees', icon: Briefcase },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#01411C] text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 flex items-center justify-center border-b border-white/10">
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold tracking-wider">GREENLEAF</h1>
            <span className="text-xs text-[#FDB913] font-medium tracking-widest">HOTEL & RESORT</span>
          </div>
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
          <button className="flex items-center w-full px-4 py-3 text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-lg transition-colors">
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-2xl font-bold text-[#01411C]">{title}</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-[#FDB913] transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#01411C] text-[#FDB913] flex items-center justify-center font-bold">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 overflow-y-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
