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
    <div className={`fixed inset-0 z-[100] bg-[#2C4A3B] flex flex-col items-center justify-center text-white transition-opacity duration-700 ease-in-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="w-24 h-24 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#4A7C59]/50 animate-bounce">
          <Database className="text-[#4A7C59]" size={48} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
          Hotel Management System
        </h1>
        <p className="text-[#F4D35E] text-lg font-bold tracking-[0.2em] uppercase">DBMS Lab Project</p>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mt-8 border border-white/20 shadow-xl max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500">
           <div className="space-y-4 text-left">
              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-[#4A7C59] rounded-lg"><User size={20} /></div>
                 <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider">Student Name</p>
                    <p className="text-xl font-bold">Raza Ali</p>
                 </div>
              </div>
              
              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-[#4A7C59] rounded-lg"><School size={20} /></div>
                 <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider">University ID</p>
                    <p className="text-xl font-bold">IU04-0324-0201</p>
                 </div>
              </div>

              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-[#4A7C59] rounded-lg"><BookOpen size={20} /></div>
                 <div>
                     <p className="text-xs text-gray-300 uppercase tracking-wider">Course</p>
                     <p className="font-semibold">DBMS Lab</p>
                 </div>
              </div>

              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-[#4A7C59] rounded-lg"><User size={20} /></div>
                 <div>
                     <p className="text-xs text-gray-300 uppercase tracking-wider">Instructor</p>
                     <p className="font-semibold">Amna Owais</p>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="mt-12">
          <Loader2 className="animate-spin mx-auto text-[#F4D35E]" size={32} />
          <p className="text-sm text-gray-400 mt-2 animate-pulse">Initializing System...</p>
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
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}

export default App;