import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Database } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern/Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#F5F3FF] via-[#FDF2F8] to-[#EFF6FF]">
         <div className="absolute top-0 left-0 w-96 h-96 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#F472B6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-0 left-20 w-96 h-96 bg-[#60A5FA] rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in duration-700 border border-white/50">
        
        {/* Header */}
        <div className="p-6 sm:p-8 lg:p-10 text-center border-b border-slate-100">
             <div className="flex flex-col items-center justify-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500 cursor-default rotate-3 group-hover:rotate-6">
                   <Database className="text-[#8B5CF6] w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-700 tracking-tight font-sans">HOTEL MANAGER</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="h-px w-8 bg-slate-200"></span>
                    <span className="text-[10px] sm:text-xs text-[#F472B6] font-bold tracking-[0.2em] uppercase">DBMS Lab</span>
                    <span className="h-px w-8 bg-slate-200"></span>
                </div>
             </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-[#FFF1F2] text-[#E11D48] p-4 rounded-xl text-sm text-center font-semibold border border-[#FECDD3] animate-pulse shadow-sm flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] inline-block"></span>
              {error}
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wide">Email Access</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B5CF6] transition-colors duration-300 pointer-events-none">
                    <Mail size={20} className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none transition-all duration-300 font-medium text-slate-800 placeholder-slate-400 text-sm sm:text-base hover:bg-white"
                  placeholder="admin@hotel.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wide">Secure Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B5CF6] transition-colors duration-300 pointer-events-none">
                    <Lock size={20} className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none transition-all duration-300 font-medium text-slate-800 placeholder-slate-400 text-sm sm:text-base hover:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#8B5CF6] text-white py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[#7C3AED] hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
          >
            Access Dashboard
          </button>
        </form>

        <div className="bg-slate-50/80 p-4 text-center border-t border-slate-100 backdrop-blur-sm">
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                System Developed by <span className="text-[#8B5CF6]">Raza Ali</span>
            </p>
        </div>
      </div>
    </div>
  );
};