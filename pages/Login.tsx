import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-[#01411C] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center bg-white border-b border-gray-100">
             <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#01411C] rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-[#FDB913]">
                   <Lock className="text-[#FDB913]" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-[#01411C] tracking-wide">GREENLEAF</h1>
                <span className="text-xs text-[#FDB913] font-bold tracking-widest uppercase">Hotel & Resort</span>
             </div>
             <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01411C] focus:border-[#01411C] outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01411C] focus:border-[#01411C] outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#01411C] text-white py-3 rounded-lg font-semibold hover:bg-[#013515] transition-colors focus:ring-4 focus:ring-green-900/20 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
            Authorized Personnel Only
        </div>
      </div>
    </div>
  );
};
