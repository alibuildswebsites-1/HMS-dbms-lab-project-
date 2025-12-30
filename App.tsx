import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2, Database, School, User, BookOpen } from 'lucide-react';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Rooms } from './pages/Rooms';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Employees } from './pages/Employees';
import { SqlConsole } from './pages/SqlConsole';
import { ERDiagram } from './pages/ERDiagram';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 4000); // Display time
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-[#A78BFA] via-[#F472B6] to-[#60A5FA] flex flex-col items-center justify-center text-white transition-opacity duration-700 ease-in-out px-4 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-2xl text-center space-y-6 sm:space-y-10 animate-in fade-in zoom-in duration-1000">
        {/* Logo */}
        <div className="relative">
             <div className="absolute inset-0 bg-white blur-3xl opacity-30 rounded-full"></div>
             <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/30 animate-bounce">
                <Database className="text-white w-10 h-10 sm:w-14 sm:h-14 drop-shadow-md" />
             </div>
        </div>

        {/* Titles */}
        <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-2 sm:mb-4 drop-shadow-xl">
            Hotel Management
            </h1>
            <p className="text-white/80 text-sm sm:text-lg md:text-xl font-bold tracking-[0.3em] uppercase">DBMS Lab Project</p>
        </div>

        {/* Info Card - Responsive Grid */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl mx-auto transform hover:scale-[1.02] transition-transform duration-500">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
              {/* Item 1 */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg shrink-0"><User size={18} className="sm:w-5 sm:h-5" /></div>
                 <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider truncate">Student Name</p>
                    <p className="text-base sm:text-lg font-bold truncate">Raza Ali</p>
                 </div>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg shrink-0"><School size={18} className="sm:w-5 sm:h-5" /></div>
                 <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider truncate">University ID</p>
                    <p className="text-base sm:text-lg font-bold truncate">IU04-0324-0201</p>
                 </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg shrink-0"><BookOpen size={18} className="sm:w-5 sm:h-5" /></div>
                 <div className="min-w-0">
                     <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider truncate">Course</p>
                     <p className="text-sm sm:text-base font-semibold truncate">DBMS Lab</p>
                 </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg shrink-0"><User size={18} className="sm:w-5 sm:h-5" /></div>
                 <div className="min-w-0">
                     <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider truncate">Instructor</p>
                     <p className="text-sm sm:text-base font-semibold truncate">Amna Owais</p>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Loader */}
        <div className="mt-8 sm:mt-12">
          <Loader2 className="animate-spin mx-auto text-white w-6 h-6 sm:w-8 sm:h-8" />
          <p className="text-xs sm:text-sm text-white/60 mt-2 animate-pulse tracking-wide">Initializing System Resources...</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/sql-console" element={<ProtectedRoute><SqlConsole /></ProtectedRoute>} />
              <Route path="/er-diagram" element={<ProtectedRoute><ERDiagram /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}

export default App;