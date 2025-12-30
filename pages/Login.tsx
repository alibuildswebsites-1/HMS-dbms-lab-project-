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
    <div className="min-h-screen bg-[#2C4A3B] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-700 hover:shadow-3xl transition-shadow">
        <div className="p-8 text-center bg-white border-b border-gray-100">
             <div className="flex flex-col items-center justify-center mb-4 group">
                <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500 cursor-default">
                   <Database className="text-[#4A7C59]" size={36} />
                </div>
                <h1 className="text-2xl font-extrabold text-[#2C4A3B] tracking-tight font-sans">HOTEL MANAGEMENT</h1>
                <span className="text-xs text-[#F4D35E] font-bold tracking-[0.3em] uppercase mt-1">DBMS Lab Project</span>
             </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="bg-[#FCE8E6] text-[#8C1D18] p-3 rounded-xl text-sm text-center font-semibold border border-[#E07A5F]/20 animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#2C4A3B] mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A7C59] transition-colors duration-300" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none transition-all duration-300 font-medium text-gray-800 placeholder-gray-400"
                  placeholder="admin@hotel.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C4A3B] mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A7C59] transition-colors duration-300" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none transition-all duration-300 font-medium text-gray-800 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4A7C59] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#3B6347] transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#4A7C59]/30 active:scale-95"
          >
            Access System
          </button>
        </form>
        <div className="bg-[#F3F6F4] p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Developed by Raza Ali</p>
            <p className="text-[10px] text-gray-400 mt-0.5">ID: IU04-0324-0201 | Inst: Amna Owais</p>
        </div>
      </div>
    </div>
  );
};