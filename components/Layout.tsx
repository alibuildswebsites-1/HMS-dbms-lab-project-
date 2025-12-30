import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BedDouble, CalendarCheck, 
  CreditCard, Briefcase, LogOut, User, Menu, X, Database, Terminal, Network
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
    { path: '/sql-console', label: 'SQL Console', icon: Terminal },
    { path: '/er-diagram', label: 'ER Diagram', icon: Network },
  ];

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-600">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white text-slate-600 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-xl flex flex-col border-r border-slate-100
        md:translate-x-0 md:static md:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between md:justify-center border-b border-slate-50 bg-white">
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-12 h-12 bg-[#8B5CF6] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
               <Database size={24} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-widest text-slate-700 group-hover:text-[#8B5CF6] transition-colors duration-300">DBMS PROJECT</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-[0.2em] mt-1">HOTEL MANAGER</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-[#8B5CF6] transition-colors hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out group font-medium ${
                  isActive
                    ? 'bg-[#F5F3FF] text-[#8B5CF6] shadow-sm shadow-violet-100 translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#8B5CF6] hover:translate-x-1'
                }`
              }
            >
              <item.icon size={20} className={`mr-3 transition-transform duration-300 group-hover:scale-110 ${
                  ({isActive}: any) => isActive ? 'text-[#8B5CF6]' : 'text-slate-400 group-hover:text-[#8B5CF6]'
              }`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-[#FB7185] hover:bg-[#FFF1F2] rounded-2xl transition-all duration-300 font-medium hover:pl-6 group"
          >
            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 border-b border-slate-100 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-[#8B5CF6] transition-colors md:hidden hover:scale-110 duration-200"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 truncate animate-in fade-in slide-in-from-left-4 duration-500">{title}</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 group cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors duration-300">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-slate-700">Raza Ali</p>
                <p className="text-[10px] sm:text-xs text-[#8B5CF6] font-medium">IU04-0324-0201</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center border border-violet-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in zoom-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};